use serde::{Deserialize, Serialize};
use type_reflect::*;

use crate::{branded_string, proto, types::card::ShahrazadCardId};

// zone.rs
branded_string!(ShahrazadZoneId);

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum ZoneName {
    INVALID = 0,
    HAND = 1,
    LIBRARY = 2,
    BATTLEFIELD = 3,
    GRAVEYARD = 4,
    EXILE = 5,
    COMMAND = 6,
    SIDEBOARD = 7,
    STACK = 8,
}

impl From<i32> for ZoneName {
    fn from(value: i32) -> Self {
        match value {
            0 => ZoneName::INVALID,
            1 => ZoneName::HAND,
            2 => ZoneName::LIBRARY,
            3 => ZoneName::BATTLEFIELD,
            4 => ZoneName::GRAVEYARD,
            5 => ZoneName::EXILE,
            6 => ZoneName::COMMAND,
            7 => ZoneName::SIDEBOARD,
            8 => ZoneName::STACK,
            _ => ZoneName::INVALID,
        }
    }
}

impl From<ZoneName> for i32 {
    fn from(value: ZoneName) -> Self {
        match value {
            ZoneName::INVALID => 0,
            ZoneName::HAND => 1,
            ZoneName::LIBRARY => 2,
            ZoneName::BATTLEFIELD => 3,
            ZoneName::GRAVEYARD => 4,
            ZoneName::EXILE => 5,
            ZoneName::COMMAND => 6,
            ZoneName::SIDEBOARD => 7,
            ZoneName::STACK => 8,
        }
    }
}

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct ShahrazadZone {
    pub cards: Vec<ShahrazadCardId>,
    pub name: ZoneName,
}

impl std::hash::Hash for ShahrazadZone {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        for card in &self.cards {
            card.hash(state);
        }
        i32::from(self.name.clone()).hash(state);
    }
}

impl From<ShahrazadZone> for proto::zone::ShahrazadZone {
    fn from(value: ShahrazadZone) -> Self {
        proto::zone::ShahrazadZone {
            cards: value.cards.iter().map(|c| c.clone().into()).collect(),
            name: i32::from(value.name),
        }
    }
}
impl From<proto::zone::ShahrazadZone> for ShahrazadZone {
    fn from(value: proto::zone::ShahrazadZone) -> ShahrazadZone {
        ShahrazadZone {
            cards: value.cards.iter().map(|c| c.clone().into()).collect(),
            name: ZoneName::from(value.name),
        }
    }
}
