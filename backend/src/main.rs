use axum::{
    extract::{
        ws::{Message, WebSocket},
        Path, Query, State, WebSocketUpgrade,
    },
    http::{Response, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use backend::state::*;
use futures::{SinkExt, StreamExt};
use serde_json;
use shared::types::{
    action::ShahrazadAction,
    api::{CreateGameQuery, CreateGameResponse, JoinGameQuery, JoinGameResponse},
    ws::ClientAction,
};
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;
use uuid::Uuid;

const PORT: u16 = 5000;

#[tokio::main]
async fn main() {
    let state = Arc::new(GameStateManager::new());

    let cors = CorsLayer::permissive();
    let app = Router::new()
        .route("/create_game", post(create_game))
        .route("/join_game/:game_id", get(join_game))
        .route("/ws/game/:game_id/player/:player_id", get(game_handler))
        .fallback(fallback)
        .layer(cors)
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], PORT));
    let listener = TcpListener::bind(addr).await.unwrap();
    println!("Server running on http://localhost:{}", PORT);
    axum::serve(listener, app).await.unwrap();
}

async fn fallback() -> impl IntoResponse {
    "route not found".to_string()
}

async fn create_game(
    State(state): State<Arc<GameStateManager>>,
    Json(CreateGameQuery { settings }): Json<CreateGameQuery>,
) -> impl IntoResponse {
    let Ok(game_info) = (*state).create_game(settings).await else {
        return "Failed to create game".to_string();
    };
    let response = CreateGameResponse {
        game_id: game_info.game_id.into(),
        player_id: game_info.host_id.into(),
        code: game_info.code,
    };
    serde_json::to_string(&response).unwrap()
}

async fn join_game(
    State(state): State<Arc<GameStateManager>>,
    Path(game_id): Path<String>,
    Query(params): Query<JoinGameQuery>,
) -> impl IntoResponse {
    let Some(game_id) = state.parse_uuid(game_id.clone()).await else {
        return format!("{}:invalid_id", game_id);
    };

    // Handle reconnection
    if let Some(player_id_str) = params.player_id {
        if let Ok(player_id) = Uuid::parse_str(&player_id_str) {
            if let Ok(game_info) = (*state).reconnect_player(game_id, player_id).await {
                return serde_json::json!(JoinGameResponse {
                    player_name: game_info.name,
                    game_id: game_info.game_id.into(),
                    player_id: player_id.into(),
                    game: game_info.game,
                    code: game_info.code,
                    reconnected: true
                })
                .to_string();
            }
        }
    }

    // Handle new player joining
    let player_id = Uuid::new_v4();
    match (*state).add_player(game_id, player_id).await {
        Ok(game_info) => serde_json::json!(JoinGameResponse {
            player_name: game_info.name,
            game_id: game_info.game_id.into(),
            player_id: player_id.into(),
            game: game_info.game,
            code: game_info.code,
            reconnected: false
        })
        .to_string(),
        Err(_) => "Game not found".to_string(),
    }
}

async fn handle_socket(
    socket: WebSocket,
    game_id: Uuid,
    player_id: Uuid,
    state: Arc<GameStateManager>,
) {
    if !(*state).validate_connection(game_id, player_id).await {
        return;
    }

    let game_subscription = match (*state).subscribe_to_game(game_id).await {
        Ok(sub) => sub,
        Err(_) => return,
    };

    let (mut sender, mut receiver) = socket.split();

    // Send initial game state
    if let Ok(initial_update) = (*state).get_game_state(game_id, player_id).await {
        if let Ok(json) = serde_json::to_string(&initial_update) {
            let _ = sender.send(Message::Text(json)).await;
        }
    }

    // Handle incoming server updates
    let send_task = tokio::spawn({
        let mut game_subscription = game_subscription;
        async move {
            loop {
                match game_subscription.recv().await {
                    Ok(update) => {
                        // Skip if it's our own update without game state
                        if update.player_id == player_id && update.game.is_none() {
                            continue;
                        }
                        // Skip if it's another player's update without an action
                        if update.player_id != player_id && update.action.is_none() {
                            continue;
                        }

                        if let Ok(json) = serde_json::to_string(&update) {
                            if sender.send(Message::Text(json)).await.is_err() {
                                break;
                            }
                        }
                        // Check for game termination
                        if let Some(action) = &update.action {
                            if matches!(action, ShahrazadAction::GameTerminated) {
                                break;
                            }
                        }
                    }
                    Err(_) => {
                        break;
                    }
                }
            }

            let _ = sender.close().await;
        }
    });

    // Handle incoming client actions
    let receive_task = tokio::spawn({
        let state = state.clone();
        async move {
            while let Some(message) = receiver.next().await {
                match message {
                    Ok(Message::Text(text)) => {
                        let client_action = match serde_json::from_str::<ClientAction>(&text) {
                            Ok(action) => action,
                            Err(_) => continue,
                        };
                        if (*state)
                            .process_action(player_id, game_id, client_action)
                            .await
                            .is_err()
                        {
                            break;
                        }
                    }
                    Ok(Message::Close(_)) => break,
                    Err(_) => break,
                    _ => continue,
                }
            }
        }
    });

    tokio::select! {
        _ = send_task => {},
        _ = receive_task => {},
    }

    let _ = (*state).disconnect_player(game_id, player_id).await;
}

async fn game_handler(
    ws: WebSocketUpgrade,
    Path((game_id, player_id)): Path<(String, String)>,
    State(state): State<Arc<GameStateManager>>,
) -> impl IntoResponse {
    let error = Response::builder()
        .status(StatusCode::FORBIDDEN)
        .body("Invalid game_id or player_id".into())
        .unwrap();
    let Ok(player_id) = Uuid::parse_str(&player_id) else {
        return error;
    };
    let Some(game_id) = state.parse_uuid(game_id.clone()).await else {
        return error;
    };
    if !state.validate_connection(game_id, player_id).await {
        return error;
    }
    ws.on_upgrade(move |socket| handle_socket(socket, game_id, player_id, state))
}
