use serde::{Deserialize, Serialize};
use type_reflect::*;

use crate::{branded_string, types::zone::ShahrazadZoneId};

use super::game::ShahrazadPlaymatId;

branded_string!(ShahrazadCardId);
branded_string!(ShahrazadCardName);

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, Default, PartialEq, Eq)]
pub struct ShahrazadCounter {
    pub amount: i16,
}

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, Default, PartialEq, Eq)]
pub struct ShahrazadCardState {
    pub inverted: Option<bool>,
    pub flipped: Option<bool>,
    pub tapped: Option<bool>,
    pub face_down: Option<bool>,
    pub revealed: Option<Vec<ShahrazadPlaymatId>>,
    pub x: Option<u8>,
    pub y: Option<u8>,
    pub counters: Option<Vec<ShahrazadCounter>>,
}
impl ShahrazadCardState {
    pub fn apply(&mut self, other: &ShahrazadCardState) {
        if let Some(inverted) = other.inverted {
            self.inverted = Some(inverted);
        }
        if let Some(flipped) = other.flipped {
            self.flipped = Some(flipped);
        }
        if let Some(tapped) = other.tapped {
            self.tapped = Some(tapped);
        }
        if let Some(face_down) = other.face_down {
            self.face_down = Some(face_down);
        }
        if let Some(x) = other.x {
            self.x = if x < 255 { Some(x) } else { None };
        }
        if let Some(y) = other.y {
            self.y = if y < 255 { Some(y) } else { None };
        }
        if let Some(counters) = &other.counters {
            self.counters = Some(counters.clone());
        }
        if let Some(new_revealed) = &other.revealed {
            if let Some(revealed) = &mut self.revealed {
                revealed.append(&mut new_revealed.clone());
            } else {
                self.revealed = Some(new_revealed.clone())
            }
        }
    }
}

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct ShahrazadCard {
    pub state: ShahrazadCardState,
    pub card_name: ShahrazadCardName,
    pub location: ShahrazadZoneId,
    pub owner: ShahrazadPlaymatId,
}

impl ShahrazadCard {
    pub fn migrate(&mut self, id: ShahrazadZoneId) {
        self.location = id;
    }
}
