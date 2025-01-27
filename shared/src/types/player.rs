use serde::{Deserialize, Serialize};
use type_reflect::*;

#[derive(Reflect, Deserialize, Serialize, Clone, Debug, PartialEq)]
pub struct ShahrazadPlayer {
    pub display_name: String,
}
