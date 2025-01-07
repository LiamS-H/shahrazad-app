use serde::{Deserialize, Serialize};
use type_reflect::*;

use uuid::Uuid;

use super::{action::ShahrazadAction, game::ShahrazadGame};

#[derive(Reflect, Clone, Serialize, Deserialize)]
pub struct ClientAction {
    pub action: ShahrazadAction,
    pub sequence_number: u64,
}

#[derive(Reflect, Clone, Serialize, Deserialize)]
pub struct ServerUpdate {
    pub action: Option<ShahrazadAction>,
    pub game: Option<ShahrazadGame>,
    pub sequence_number: u64,
    pub player_id: Uuid,
}
