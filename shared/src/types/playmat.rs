use std::collections::HashMap;
use std::hash::Hasher;

use serde::{Deserialize, Serialize};
use type_reflect::*;

use crate::proto;

use crate::branded_string;

use super::zone::ShahrazadZoneId;

branded_string!(ShahrazadPlaymatId);

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct ShahrazadPlaymat {
    pub library: ShahrazadZoneId,
    pub hand: ShahrazadZoneId,
    pub graveyard: ShahrazadZoneId,
    pub battlefield: ShahrazadZoneId,
    pub exile: ShahrazadZoneId,
    pub command: ShahrazadZoneId,
    pub sideboard: ShahrazadZoneId,
    pub life: i32,
    pub mulligans: i8,
    pub command_damage: HashMap<ShahrazadPlaymatId, i32>,
    pub player: ShahrazadPlayer,
}

impl std::hash::Hash for ShahrazadPlaymat {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.library.hash(state);
        self.hand.hash(state);
        self.graveyard.hash(state);
        self.battlefield.hash(state);
        self.exile.hash(state);
        self.command.hash(state);
        self.life.hash(state);
        self.mulligans.hash(state);
        let mut damages: Vec<_> = self.command_damage.iter().collect();
        damages.sort_by(|a, b| a.0.cmp(b.0));
        for damage in damages {
            damage.0.hash(state);
            damage.1.hash(state);
        }
        self.player.hash(state);
    }
}

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
