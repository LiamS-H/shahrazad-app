use serde::{Deserialize, Serialize};
use type_reflect::*;

use crate::proto;

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum DeckTopReveal {
    NONE = 0,
    PRIVATE = 1,
    PUBLIC = 2,
}

impl Default for DeckTopReveal {
    fn default() -> Self {
        DeckTopReveal::NONE
    }
}

impl From<i32> for DeckTopReveal {
    fn from(value: i32) -> Self {
        match value {
            0 => DeckTopReveal::NONE,
            1 => DeckTopReveal::PRIVATE,
            2 => DeckTopReveal::PUBLIC,
            _ => DeckTopReveal::NONE,
        }
    }
}

impl From<DeckTopReveal> for i32 {
    fn from(value: DeckTopReveal) -> Self {
        match value {
            DeckTopReveal::NONE => 0,
            DeckTopReveal::PRIVATE => 1,
            DeckTopReveal::PUBLIC => 2,
        }
    }
}

#[derive(Reflect, Deserialize, Serialize, Clone, Debug, PartialEq, Default)]
pub struct ShahrazadPlayer {
    pub display_name: String,
    pub reveal_deck_top: DeckTopReveal,
}

impl From<ShahrazadPlayer> for proto::playmat::ShahrazadPlayer {
    fn from(value: ShahrazadPlayer) -> Self {
        proto::playmat::ShahrazadPlayer {
            display_name: value.display_name,
            reveal_deck_top: value.reveal_deck_top.into(),
        }
    }
}

impl From<proto::playmat::ShahrazadPlayer> for ShahrazadPlayer {
    fn from(value: proto::playmat::ShahrazadPlayer) -> Self {
        ShahrazadPlayer {
            display_name: value.display_name,
            reveal_deck_top: value.reveal_deck_top.into(),
        }
    }
}

impl std::hash::Hash for ShahrazadPlayer {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.display_name.hash(state);
        i32::from(self.reveal_deck_top.clone()).hash(state);
    }
}
