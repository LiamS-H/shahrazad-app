use serde::{Deserialize, Serialize};
use type_reflect::*;

use super::game::ShahrazadGame;

#[derive(Reflect, Deserialize, Serialize)]
pub struct JoinGameQuery {
    pub player_id: Option<String>,
}

#[derive(Reflect, Serialize)]
pub struct CreateGameResponse {
    pub game_id: String,
    pub player_id: String,
}

#[derive(Reflect, Serialize)]
pub struct JoinGameResponse {
    pub game: ShahrazadGame,
    pub game_id: String,
    pub player_id: String,
    pub reconnected: bool,
}
