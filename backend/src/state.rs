use dashmap::DashMap;
use rand::Rng;
use shared::types::game::{ShahrazadGame, ShahrazadGameSettings};
use shared::types::{
    action::ShahrazadAction,
    ws::{ClientAction, ServerUpdate},
};
use std::sync::Arc;
use tokio::sync::broadcast;
use tokio::time::{Duration, Instant};
use uuid::Uuid;

#[derive(Clone)]
pub struct GameInfo {
    pub host_id: Uuid,
    pub game_id: Uuid,
    pub name: String,
    pub game: ShahrazadGame,
    pub code: u32,
}

#[derive(Clone)]
pub struct GameState {
    game: ShahrazadGame,
    host_id: Uuid,
    sequence_number: u64,
    players: DashMap<Uuid, Player>,
    tx: broadcast::Sender<ServerUpdate>,
    last_activity: Instant,
    code: u32,
}

#[derive(Clone)]
struct Player {
    connected: bool,
    name: String,
}

pub struct GameStateManager {
    games: Arc<DashMap<Uuid, GameState>>,
    codes: Arc<DashMap<u32, Uuid>>,
}

const GAME_CLEANUP_INTERVAL: Duration = Duration::from_secs(60);
const GAME_TIMEOUT: Duration = Duration::from_secs(3000);

impl GameStateManager {
    pub fn new() -> Self {
        let manager = Self {
            games: Arc::new(DashMap::new()),
            codes: Arc::new(DashMap::new()),
        };

        let games = manager.games.clone();
        tokio::spawn(async move {
            loop {
                let games_to_remove: Vec<_> = games
                    .iter()
                    .filter_map(|entry| {
                        let game_id = *entry.key();
                        let elapsed = entry.value().last_activity.elapsed();
                        if elapsed >= GAME_TIMEOUT {
                            Some((game_id, entry.value().players.clone()))
                        } else {
                            None
                        }
                    })
                    .collect();

                for (game_id, _) in &games_to_remove {
                    if let Some(game_ref) = games.get(&game_id) {
                        let disconnect_update = ServerUpdate {
                            action: Some(ShahrazadAction::GameTerminated),
                            game: None,
                            sequence_number: game_ref.sequence_number + 1,
                            player_id: *game_id,
                        };
                        let _ = game_ref.tx.send(disconnect_update);
                    }
                }
                tokio::time::sleep(GAME_CLEANUP_INTERVAL).await;

                for (game_id, _) in games_to_remove {
                    games.remove(&game_id);
                }
            }
        });

        manager
    }

    pub async fn create_game(&self, settings: ShahrazadGameSettings) -> Result<GameInfo, String> {
        let (tx, _) = broadcast::channel(100);
        let game_id = Uuid::new_v4();
        let host_id = Uuid::new_v4();

        let mut rng = rand::thread_rng();
        let mut code: u32 = rng.gen_range(100_000..=999_999);
        while self.codes.contains_key(&code) {
            code = rng.gen_range(100_000..=999_999);
        }

        let mut game_state = GameState {
            game: ShahrazadGame::new(settings),
            host_id,
            sequence_number: 0,
            players: DashMap::new(),
            tx,
            last_activity: Instant::now(),
            code: code.clone(),
        };

        self.codes.insert(code, game_id);

        let player_name: String = "P0".into();

        game_state.players.insert(
            host_id,
            Player {
                connected: false,
                name: player_name.clone(),
            },
        );

        let add_player = ShahrazadAction::AddPlayer {
            player_id: player_name.clone(),
        };

        if let Some(_) = ShahrazadGame::apply_action(add_player.clone(), &mut game_state.game) {
            let update = ServerUpdate {
                action: Some(add_player),
                game: None,
                sequence_number: 0,
                player_id: host_id,
            };
            let _ = game_state.tx.send(update);
        }

        self.games.insert(game_id, game_state);

        let game_state = self.games.get(&game_id).unwrap();

        Ok(GameInfo {
            host_id,
            game_id,
            name: player_name.clone(),
            game: game_state.game.clone(),
            code: game_state.code,
        })
    }

    pub async fn add_player(&self, game_id: Uuid, player_id: Uuid) -> Result<GameInfo, String> {
        let mut game_state = self.games.get_mut(&game_id).ok_or("Game not found")?;

        let player_name: String = format!("P{}", game_state.players.len());

        game_state.players.insert(
            player_id,
            Player {
                connected: false,
                name: player_name.clone(),
            },
        );

        let add_player = ShahrazadAction::AddPlayer {
            player_id: player_name.clone(),
        };

        if let Some(_) = ShahrazadGame::apply_action(add_player.clone(), &mut game_state.game) {
            game_state.sequence_number += 1;

            let update = ServerUpdate {
                action: Some(add_player),
                game: None,
                sequence_number: game_state.sequence_number,
                player_id,
            };

            let _ = game_state.tx.send(update);
        }

        Ok(GameInfo {
            name: player_name.clone(),
            game_id,
            host_id: game_state.host_id,
            game: game_state.game.clone(),
            code: game_state.code,
        })
    }

    pub async fn reconnect_player(
        &self,
        game_id: Uuid,
        player_id: Uuid,
    ) -> Result<GameInfo, String> {
        let mut game_state = self.games.get_mut(&game_id).ok_or("Game not found")?;
        game_state.last_activity = Instant::now();

        let Some(mut player) = game_state.players.get_mut(&player_id) else {
            return Err("Player not found".to_string());
        };
        player.connected = true;

        Ok(GameInfo {
            name: player.name.clone(),
            game_id,
            host_id: game_state.host_id,
            game: game_state.game.clone(),
            code: game_state.code,
        })
    }

    pub async fn subscribe_to_game(
        &self,
        game_id: Uuid,
    ) -> Result<broadcast::Receiver<ServerUpdate>, String> {
        self.games
            .get(&game_id)
            .map(|game| game.tx.subscribe())
            .ok_or("Game not found".to_string())
    }

    pub async fn validate_connection(&self, game_id: Uuid, player_id: Uuid) -> bool {
        if let Some(game_ref) = self.games.get(&game_id) {
            return game_ref.players.contains_key(&player_id);
        } else {
            return false;
        }
    }

    pub async fn get_game_state(
        &self,
        game_id: Uuid,
        player_id: Uuid,
    ) -> Result<ServerUpdate, String> {
        let game_ref = self.games.get(&game_id).ok_or("Game not found")?;

        let sequence_number = game_ref.sequence_number;

        return Ok(ServerUpdate {
            action: None,
            game: Some(game_ref.game.clone()),
            player_id,
            sequence_number,
        });
    }

    pub async fn process_action(
        &self,
        player_id: Uuid,
        game_id: Uuid,
        client_action: ClientAction,
    ) -> Result<ServerUpdate, String> {
        let mut game_ref = self.games.get_mut(&game_id).ok_or("Game not found")?;
        game_ref.last_activity = Instant::now();

        let action_applied =
            ShahrazadGame::apply_action(client_action.action.clone(), &mut game_ref.game);

        let Some(_) = action_applied else {
            return Ok(ServerUpdate {
                action: None,
                game: Some(game_ref.game.clone()),
                sequence_number: game_ref.sequence_number,
                player_id,
            });
        };

        game_ref.sequence_number += 1;

        // Handle client desync
        // This triggers when a client attempts to make an update and its own state is outdated
        // The server then attempts to process the action, and then updates the client with full state
        if client_action.sequence_number < game_ref.sequence_number {
            let full_state = ServerUpdate {
                action: None,
                game: Some(game_ref.game.clone()),
                sequence_number: game_ref.sequence_number,
                player_id,
            };
            let _ = game_ref.tx.send(full_state);

            let action_update = ServerUpdate {
                action: Some(client_action.action),
                game: None,
                sequence_number: game_ref.sequence_number,
                player_id,
            };
            let _ = game_ref.tx.send(action_update.clone());
            return Ok(action_update);
        }

        let update = ServerUpdate {
            action: Some(client_action.action),
            game: None,
            sequence_number: game_ref.sequence_number,
            player_id,
        };

        let _ = game_ref.tx.send(update.clone());
        Ok(update)
    }

    pub async fn parse_uuid(&self, id_str: String) -> Option<Uuid> {
        if id_str.len() == 6 {
            match id_str.parse::<u32>() {
                Ok(num) => {
                    if let Some(uuid) = self.codes.get(&num) {
                        return Some(uuid.clone());
                    }
                    return None;
                }
                Err(_) => return None,
            };
        }
        match Uuid::parse_str(&id_str) {
            Ok(uuid) => return Some(uuid.clone()),
            Err(_) => return None,
        };
    }

    pub async fn get_game_code(&self, game_id: Uuid) -> Option<u32> {
        let Some(game) = self.games.get(&game_id) else {
            return None;
        };
        return Some(game.code.clone());
    }

    pub async fn disconnect_player(&self, game_id: Uuid, player_id: Uuid) -> Result<(), String> {
        if let Some(game_ref) = self.games.get(&game_id) {
            if let Some(mut player) = game_ref.players.get_mut(&player_id) {
                player.connected = false;
            }
        }
        Ok(())
    }
}
