use serde::{Deserialize, Serialize};
use type_reflect::*;

use crate::{branded_string, proto, types::card::ShahrazadCardId};

// zone.rs
branded_string!(ShahrazadZoneId);

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct ShahrazadZone {
    pub cards: Vec<ShahrazadCardId>,
}

impl std::hash::Hash for ShahrazadZone {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        for card in &self.cards {
            card.hash(state);
        }
    }
}

impl From<ShahrazadZone> for proto::zone::ShahrazadZone {
    fn from(value: ShahrazadZone) -> Self {
        proto::zone::ShahrazadZone {
            cards: value.cards.iter().map(|c| c.clone().into()).collect(),
        }
    }
}
impl From<proto::zone::ShahrazadZone> for ShahrazadZone {
    fn from(value: proto::zone::ShahrazadZone) -> ShahrazadZone {
        ShahrazadZone {
            cards: value.cards.iter().map(|c| c.clone().into()).collect(),
        }
    }
}
