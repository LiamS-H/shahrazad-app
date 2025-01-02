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

#[derive(Clone, Serialize, Deserialize)]
struct GameUpdate {
    action: ShahrazadAction,
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

const PORT: u16 = 5000;

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
    let (tx, _rx) = broadcast::channel(10);

    let game_state = GameState {
        game: ShahrazadGame::new(),
        host_id,
        players: DashMap::new(),
        tx: tx.clone(),
    };

    game_state
        .players
        .insert(host_id, PlayerConnection { connected: false });

    state.games.insert(game_id, game_state);

    // Add host to game
    let add_player = ShahrazadAction::AddPlayer {
        uuid: host_id.to_string(),
    };

    if let Some(mut game_ref) = state.games.get_mut(&game_id) {
        if let Some(_) = ShahrazadGame::apply_action(add_player.clone(), &mut game_ref.game) {
            let update = GameUpdate {
                action: add_player,
                player_id: host_id,
                game_id,
            };
            let _ = game_ref.tx.send(update);
        }
    }

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

    // Handle reconnection case first
    if let Some(player_id_str) = params.player_id {
        if let Ok(player_id) = Uuid::parse_str(&player_id_str) {
            if let Some(game_ref) = state.games.get(&game_id) {
                if game_ref.players.contains_key(&player_id) {
                    return serde_json::json!({
                        "game_id": game_id,
                        "player_id": player_id,
                        "game": &game_ref.game,
                        "reconnected": true
                    })
                    .to_string();
                }
            }
        }
    }

    let player_id = Uuid::new_v4();

    {
        let mut game_ref = state.games.get_mut(&game_id).unwrap();
        game_ref
            .players
            .insert(player_id, PlayerConnection { connected: false });

        let add_player = ShahrazadAction::AddPlayer {
            uuid: player_id.to_string(),
        };

        if let Some(_) = ShahrazadGame::apply_action(add_player.clone(), &mut game_ref.game) {
            let update = GameUpdate {
                action: add_player,
                player_id,
                game_id,
            };
            let _ = game_ref.tx.send(update);
        }
    }

    // Get immutable reference for the response
    let game_ref = state.games.get(&game_id).unwrap();
    serde_json::json!({
        "game_id": game_id,
        "player_id": player_id,
        "game": &game_ref.game,
        "reconnected": false
    })
    .to_string()
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

    let game_ref = match state.games.get(&game_id) {
        Some(gs) => gs,
        None => return,
    };

    if !game_ref.players.contains_key(&player_id) {
        return;
    }

    // Update connection status
    if let Some(mut player) = game_ref.players.get_mut(&player_id) {
        player.connected = true;
    }

    let (mut sender, mut receiver) = socket.split();
    let mut rx = game_ref.tx.subscribe();
    let tx = game_ref.tx.clone();

    // Send initial game state
    let initial_state = serde_json::json!({
        "game": &game_ref.game,
    });

    if let Ok(json) = serde_json::to_string(&initial_state) {
        let _ = sender.send(Message::Text(json)).await;
    }

    // Drop the game_ref so it's not held during the async tasks
    drop(game_ref);

    // Handle incoming game updates
    let send_task = tokio::spawn({
        let state = state.clone();
        async move {
            while let Ok(update) = rx.recv().await {
                if let Some(game_ref) = state.games.get_mut(&update.game_id) {
                    // updating clients solely based on actions means that that race conditions are possible
                    // (clients apply conflicting moves at same time)
                    // the smaller packets would be better, IF we handle the race conditions (we currently do not)
                    // if we can detect conlicts, we rarely need to return full game and can mostly return actions
                    // let response = serde_json::json!({
                    //     "action": update.action,
                    // });
                    let response = serde_json::json!({
                        "game": &game_ref.game,
                    });

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
                if let Ok(action) = serde_json::from_str::<ShahrazadAction>(&text) {
                    let update = GameUpdate {
                        action,
                        player_id,
                        game_id,
                    };
                    if let Some(mut game_ref) = state.games.get_mut(&update.game_id) {
                        ShahrazadGame::apply_action(update.action.clone(), &mut game_ref.game);
                    }
                    let _ = tx.send(update);
                }
            }
        }
    });

    tokio::select! {
        _ = send_task => {},
        _ = receive_task => {},
    }

    // Update connection status at disconnect
    if let Some(game_ref) = state.games.get(&game_id) {
        if let Some(mut player) = game_ref.players.get_mut(&player_id) {
            player.connected = false;
        }
    }
}

async fn game_handler(
    ws: WebSocketUpgrade,
    Path((game_id, player_id)): Path<(String, String)>,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, game_id, player_id, state))
}
