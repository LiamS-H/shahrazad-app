use axum::{
    extract::{
        ws::{Message, WebSocket},
        Path, Query, State, WebSocketUpgrade,
    },
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use dashmap::DashMap;
use futures::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json;
use shared::types::action::ShahrazadAction;
use shared::types::game::ShahrazadGame;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::TcpListener;
use tokio::sync::broadcast;
use tower_http::cors::CorsLayer;
use uuid::Uuid;

const PORT: u16 = 5000;

#[derive(Clone, Serialize, Deserialize)]
struct GameUpdate {
    action: Option<ShahrazadAction>,
    player_id: Uuid,
    game_id: Uuid,
}

struct AppState {
    games: DashMap<Uuid, GameState>,
}

struct GameState {
    game: ShahrazadGame,
    host_id: Uuid,
    players: DashMap<Uuid, PlayerConnection>,
    tx: broadcast::Sender<GameUpdate>,
}

struct PlayerConnection {
    connected: bool,
}

#[derive(Serialize)]
struct CreateGameResponse {
    game_id: Uuid,
    player_id: Uuid,
}

#[derive(Deserialize)]
struct JoinGameQuery {
    player_id: Option<String>,
}

#[tokio::main]
async fn main() {
    let state = Arc::new(AppState {
        games: DashMap::new(),
    });

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

async fn create_game(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let game_id = Uuid::new_v4();
    let host_id = Uuid::new_v4();

    let (tx, _) = broadcast::channel(10);

    let game_state = GameState {
        game: ShahrazadGame::new(),
        host_id,
        players: DashMap::new(),
        tx,
    };

    game_state
        .players
        .insert(host_id, PlayerConnection { connected: false });
    state.games.insert(game_id, game_state);

    let response = CreateGameResponse {
        game_id,
        player_id: host_id,
    };

    serde_json::to_string(&response).unwrap()
}

async fn join_game(
    State(state): State<Arc<AppState>>,
    Path(game_id): Path<String>,
    Query(params): Query<JoinGameQuery>,
) -> impl IntoResponse {
    let game_id = match Uuid::parse_str(&game_id) {
        Ok(id) => id,
        Err(_) => return format!("{}:invalid_id", game_id),
    };

    if !state.games.contains_key(&game_id) {
        return "Game not found".to_string();
    }

    let game_state = state.games.get(&game_id).unwrap();

    if let Some(player_id_str) = params.player_id {
        if let Ok(player_id) = Uuid::parse_str(&player_id_str) {
            if game_state.players.contains_key(&player_id) {
                return serde_json::json!({
                    "game_id": game_id,
                    "player_id": player_id,
                    "reconnected": true
                })
                .to_string();
            }
        }
    }

    let player_id = Uuid::new_v4();
    game_state
        .players
        .insert(player_id, PlayerConnection { connected: false });

    // Broadcast that a new player has joined
    let update = GameUpdate {
        action: Some(ShahrazadAction::AddPlayer {
            uuid: player_id.to_string(),
        }),
        player_id,
        game_id,
    };
    let _ = game_state.tx.send(update);

    let game = &game_state.game;

    serde_json::json!({
        "game_id": game_id,
        "player_id": player_id,
        "game": game,
        "reconnected": false
    })
    .to_string()
}

#[derive(Serialize)]
struct GameStateResponse<'a> {
    game: &'a ShahrazadGame,
    host_id: Uuid,
    player_count: usize,
}

async fn handle_socket(
    socket: WebSocket,
    game_id: String,
    player_id: String,
    state: Arc<AppState>,
) {
    let (game_id, player_id) = match (Uuid::parse_str(&game_id), Uuid::parse_str(&player_id)) {
        (Ok(g), Ok(p)) => (g, p),
        _ => return,
    };

    let game_state = match state.games.get(&game_id) {
        Some(gs) => gs,
        None => return,
    };

    if !game_state.players.contains_key(&player_id) {
        return;
    }

    if let Some(mut player) = game_state.players.get_mut(&player_id) {
        player.connected = true;
    }

    let (mut sender, mut receiver) = socket.split();
    let mut rx = game_state.tx.subscribe();

    // Send initial game state
    {
        let initial_state = GameStateResponse {
            game: &game_state.game,
            host_id: game_state.host_id,
            player_count: game_state.players.len(),
        };

        if let Ok(json) = serde_json::to_string(&initial_state) {
            let _ = sender.send(Message::Text(json)).await;
        }
    }

    // Handle incoming game updates
    let send_task = tokio::spawn({
        let state = state.clone();
        async move {
            while let Ok(update) = rx.recv().await {
                if let Some(game_state) = state.games.get(&update.game_id) {
                    let response = GameStateResponse {
                        game: &game_state.game,
                        host_id: game_state.host_id,
                        player_count: game_state.players.len(),
                    };

                    if let Ok(json) = serde_json::to_string(&response) {
                        if sender.send(Message::Text(json)).await.is_err() {
                            break;
                        }
                    }
                }
            }
        }
    });

    // Handle incoming actions from this player
    let receive_task = tokio::spawn({
        let state = state.clone();
        async move {
            while let Some(Ok(Message::Text(text))) = receiver.next().await {
                let action: ShahrazadAction = match serde_json::from_str(&text) {
                    Ok(action) => action,
                    Err(_) => continue,
                };

                if let Some(mut game_state) = state.games.get_mut(&game_id) {
                    let is_host = player_id == game_state.host_id;

                    if let Some(_) =
                        ShahrazadGame::apply_action(action.clone(), &mut game_state.game)
                    {
                        // Send update with just the action and IDs
                        let update = GameUpdate {
                            action: Some(action),
                            player_id,
                            game_id,
                        };
                        let _ = game_state.tx.send(update);
                    }
                }
            }
        }
    });

    tokio::select! {
        _ = send_task => {},
        _ = receive_task => {},
    }

    if let Some(mut player) = game_state.players.get_mut(&player_id) {
        player.connected = false;
    };
}

async fn game_handler(
    ws: WebSocketUpgrade,
    Path((game_id, player_id)): Path<(String, String)>,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, game_id, player_id, state))
}
