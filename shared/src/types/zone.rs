use crate::types::ws::CompactString;
use serde::{Deserialize, Serialize};
use type_reflect::*;

use crate::{branded_string, types::card::ShahrazadCardId};

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
