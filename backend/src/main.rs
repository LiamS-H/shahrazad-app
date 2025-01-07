use axum::{
    extract::{
        ws::{Message, WebSocket},
        Path, Query, State, WebSocketUpgrade,
    },
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use backend::state::*;
use futures::{SinkExt, StreamExt};
use serde_json;
use shared::types::{
    api::{CreateGameResponse, JoinGameQuery, JoinGameResponse},
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

async fn create_game(State(state): State<Arc<GameStateManager>>) -> impl IntoResponse {
    let game_id = Uuid::new_v4();
    let host_id = Uuid::new_v4();

    if let Ok(game_info) = (*state).create_game(game_id, host_id).await {
        let response = CreateGameResponse {
            game_id: game_info.game_id.into(),
            player_id: game_info.host_id.into(),
        };
        serde_json::to_string(&response).unwrap()
    } else {
        "Failed to create game".to_string()
    }
}

async fn join_game(
    State(state): State<Arc<GameStateManager>>,
    Path(game_id): Path<String>,
    Query(params): Query<JoinGameQuery>,
) -> impl IntoResponse {
    let game_id = match Uuid::parse_str(&game_id) {
        Ok(id) => id,
        Err(_) => return format!("{}:invalid_id", game_id),
    };

    // Handle reconnection
    if let Some(player_id_str) = params.player_id {
        if let Ok(player_id) = Uuid::parse_str(&player_id_str) {
            if let Ok(game_info) = (*state).reconnect_player(game_id, player_id).await {
                return serde_json::json!(JoinGameResponse {
                    game_id: game_info.game_id.into(),
                    player_id: player_id.into(),
                    game: game_info.game,
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
            game_id: game_info.game_id.into(),
            player_id: player_id.into(),
            game: game_info.game,
            reconnected: false
        })
        .to_string(),
        Err(_) => "Game not found".to_string(),
    }
}

async fn handle_socket(
    socket: WebSocket,
    game_id: String,
    player_id: String,
    state: Arc<GameStateManager>,
) {
    let (game_id, player_id) = match (Uuid::parse_str(&game_id), Uuid::parse_str(&player_id)) {
        (Ok(g), Ok(p)) => (g, p),
        _ => return,
    };

    if !(*state).is_valid_player(game_id, player_id).await {
        return;
    }

    let (mut sender, mut receiver) = socket.split();

    // Subscribe to game updates
    if let Ok(mut game_subscription) = (*state).subscribe_to_game(game_id).await {
        // Send initial game state
        if let Ok(initial_update) = (*state).get_game_state(game_id, player_id).await {
            if let Ok(json) = serde_json::to_string(&initial_update) {
                let _ = sender.send(Message::Text(json)).await;
            }
        }

        // Handle incoming server updates
        let send_task = tokio::spawn({
            async move {
                while let Ok(update) = game_subscription.recv().await {
                    if update.player_id == player_id && update.game.is_none() {
                        continue;
                    }
                    if update.player_id != player_id && update.action.is_none() {
                        continue;
                    }
                    if let Ok(json) = serde_json::to_string(&update) {
                        if sender.send(Message::Text(json)).await.is_err() {
                            break;
                        }
                    }
                }
            }
        });

        // Handle incoming client actions
        let receive_task = tokio::spawn({
            let state = state.clone();
            async move {
                while let Some(Ok(Message::Text(text))) = receiver.next().await {
                    if let Ok(client_action) = serde_json::from_str::<ClientAction>(&text) {
                        let _ = (*state)
                            .process_action(player_id, game_id, client_action)
                            .await;
                    }
                }
            }
        });

        tokio::select! {
            _ = send_task => {},
            _ = receive_task => {},
        }
    }

    let _ = (*state).disconnect_player(game_id, player_id).await;
}

async fn game_handler(
    ws: WebSocketUpgrade,
    Path((game_id, player_id)): Path<(String, String)>,
    State(state): State<Arc<GameStateManager>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, game_id, player_id, state))
}
