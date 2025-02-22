use serde::{Deserialize, Serialize};
use type_reflect::*;

use crate::proto;

#[derive(Reflect, Deserialize, Serialize, Clone, Debug, PartialEq, Hash)]
pub struct ShahrazadPlayer {
    pub display_name: String,
}

impl From<ShahrazadPlayer> for proto::playmat::ShahrazadPlayer {
    fn from(value: ShahrazadPlayer) -> Self {
        proto::playmat::ShahrazadPlayer {
            display_name: value.display_name,
        }
    }
}

impl From<proto::playmat::ShahrazadPlayer> for ShahrazadPlayer {
    fn from(value: proto::playmat::ShahrazadPlayer) -> Self {
        ShahrazadPlayer {
            display_name: value.display_name,
        }
    }
}
