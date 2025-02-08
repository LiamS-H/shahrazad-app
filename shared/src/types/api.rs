use serde::{Deserialize, Serialize};
use type_reflect::*;

use super::{
    game::{ShahrazadGame, ShahrazadGameSettings},
    player::ShahrazadPlayer,
};

#[derive(Reflect, Deserialize, Serialize)]
pub struct JoinGameQuery {
    pub player: Option<ShahrazadPlayer>,
    pub player_id: Option<String>,
}

#[derive(Reflect, Deserialize, Serialize)]
pub struct CreateGameQuery {
    pub player: Option<ShahrazadPlayer>,
    pub settings: ShahrazadGameSettings,
}

#[derive(Reflect, Serialize)]
pub struct CreateGameResponse {
    pub game_id: String,
    pub player_id: String,
    pub code: u32,
}

#[derive(Reflect, Serialize)]
pub struct JoinGameResponse {
    pub game: ShahrazadGame,
    pub game_id: String,
    pub player_id: String,
    pub player_name: String,
    pub code: u32,
    pub reconnected: bool,
    pub hash: String,
}

#[derive(Reflect, Serialize)]
pub struct FetchGameResponse {
    pub game_id: String,
    pub code: u32,
}
