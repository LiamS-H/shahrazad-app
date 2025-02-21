use serde::{Deserialize, Serialize};
use type_reflect::*;

use super::ws::CompactString;

#[derive(Reflect, Deserialize, Serialize, Clone, Debug, PartialEq, Hash)]
pub struct ShahrazadPlayer {
    pub display_name: String,
}

impl CompactString for ShahrazadPlayer {
    fn to_compact(&self) -> String {
        self.display_name.clone()
    }

    fn from_compact(s: &str) -> Result<Self, &'static str> {
        Ok(ShahrazadPlayer {
            display_name: s.to_string(),
        })
    }
}
