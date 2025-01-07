use dashmap::DashMap;
use shared::types::game::ShahrazadGame;
use shared::types::{
    action::ShahrazadAction,
    ws::{ClientAction, ServerUpdate},
};
use tokio::sync::broadcast;
use uuid::Uuid;

#[derive(Clone)]
pub struct GameInfo {
    pub game_id: Uuid,
    pub host_id: Uuid,
    pub game: ShahrazadGame,
}

pub struct GameState {
    game: ShahrazadGame,
    host_id: Uuid,
    sequence_number: u64,
    players: DashMap<Uuid, PlayerConnection>,
    tx: broadcast::Sender<ServerUpdate>,
}

struct PlayerConnection {
    connected: bool,
}

pub struct GameStateManager {
    games: DashMap<Uuid, GameState>,
}

impl GameStateManager {
    pub fn new() -> Self {
        Self {
            games: DashMap::new(),
        }
    }

    pub async fn create_game(&self, game_id: Uuid, host_id: Uuid) -> Result<GameInfo, String> {
        let (tx, _) = broadcast::channel(100);

        let mut game_state = GameState {
            game: ShahrazadGame::new(),
            host_id,
            sequence_number: 0,
            players: DashMap::new(),
            tx,
        };

        game_state
            .players
            .insert(host_id, PlayerConnection { connected: false });

        // Add host to game
        let add_player = ShahrazadAction::AddPlayer {
            player_id: host_id.to_string(),
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

        Ok(GameInfo {
            game_id,
            host_id,
            game: self.games.get(&game_id).unwrap().game.clone(),
        })
    }

    pub async fn add_player(&self, game_id: Uuid, player_id: Uuid) -> Result<GameInfo, String> {
        let mut game_ref = self.games.get_mut(&game_id).ok_or("Game not found")?;

        game_ref
            .players
            .insert(player_id, PlayerConnection { connected: false });

        let add_player = ShahrazadAction::AddPlayer {
            player_id: player_id.to_string(),
        };

        if let Some(_) = ShahrazadGame::apply_action(add_player.clone(), &mut game_ref.game) {
            game_ref.sequence_number += 1;

            let update = ServerUpdate {
                action: Some(add_player),
                game: None,
                sequence_number: game_ref.sequence_number,
                player_id,
            };

            let _ = game_ref.tx.send(update);
        }

        Ok(GameInfo {
            game_id,
            host_id: game_ref.host_id,
            game: game_ref.game.clone(),
        })
    }

    pub async fn reconnect_player(
        &self,
        game_id: Uuid,
        player_id: Uuid,
    ) -> Result<GameInfo, String> {
        let game_ref = self.games.get(&game_id).ok_or("Game not found")?;

        if !game_ref.players.contains_key(&player_id) {
            return Err("Player not found".to_string());
        }

        if let Some(mut player) = game_ref.players.get_mut(&player_id) {
            player.connected = true;
        }

        Ok(GameInfo {
            game_id,
            host_id: game_ref.host_id,
            game: game_ref.game.clone(),
        })
    }

    pub async fn is_valid_player(&self, game_id: Uuid, player_id: Uuid) -> bool {
        self.games
            .get(&game_id)
            .map(|game| game.players.contains_key(&player_id))
            .unwrap_or(false)
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

        if let Some(_) =
            ShahrazadGame::apply_action(client_action.action.clone(), &mut game_ref.game)
        {
            game_ref.sequence_number += 1;

            // Handle client desync
            // This triggers when a client attempts to make an update and its own state is outdated
            // The server then attempt to process the action, and update client with full state
            if client_action.sequence_number < game_ref.sequence_number {
                let update = ServerUpdate {
                    action: None,
                    game: Some(game_ref.game.clone()),
                    sequence_number: game_ref.sequence_number,
                    player_id: player_id,
                };
                let _ = game_ref.tx.send(update.clone());
                let update = ServerUpdate {
                    action: Some(client_action.action),
                    game: None,
                    sequence_number: game_ref.sequence_number,
                    player_id: player_id,
                };
                let _ = game_ref.tx.send(update.clone());
                return Ok(update);
            }

            let update = ServerUpdate {
                action: Some(client_action.action),
                game: None,
                sequence_number: game_ref.sequence_number,
                player_id: player_id,
            };

            let _ = game_ref.tx.send(update.clone());
            Ok(update)
        } else {
            // Invalid move - send full state
            Ok(ServerUpdate {
                action: None,
                game: Some(game_ref.game.clone()),
                sequence_number: game_ref.sequence_number,
                player_id: player_id,
            })
        }
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
