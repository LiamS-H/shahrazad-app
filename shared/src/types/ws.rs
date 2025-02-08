use serde::{Deserialize, Serialize};
use type_reflect::*;

use uuid::Uuid;

use super::{action::ShahrazadAction, game::ShahrazadGame};

#[derive(Reflect, Clone, Serialize, Deserialize)]
pub struct ClientAction {
    pub action: Option<ShahrazadAction>,
    pub hash: Option<String>,
}

#[derive(Reflect, Clone, Serialize, Deserialize)]
pub struct ServerUpdate {
    pub action: Option<ShahrazadAction>,
    pub game: Option<ShahrazadGame>,
    pub player_id: Uuid,
    pub hash: Option<String>,
}
