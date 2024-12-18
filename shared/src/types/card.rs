use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{branded_string, types::zone::ShahrazadZoneId};

branded_string!(ShahrazadCardId);
branded_string!(CardName);

#[derive(TS, Serialize, Deserialize, Clone, Debug, Default, PartialEq, Eq)]
#[ts(export)]
pub struct ShahrazadCardOptions {
    pub inverted: Option<bool>,
    pub flipped: Option<bool>,
    pub tapped: Option<bool>,
    pub face_down: Option<bool>,
    pub x: Option<u8>, // Use f64 for floating-point numbers
    pub y: Option<u8>,
}
impl ShahrazadCardOptions {
    pub fn apply(&mut self, other: &ShahrazadCardOptions) {
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
            self.x = Some(x);
        }
        if let Some(y) = other.y {
            self.y = Some(y);
        }
    }
}

#[derive(TS, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[ts(export)]
pub struct ShahrazadCard {
    #[serde(flatten)]
    pub state: ShahrazadCardOptions,
    pub card_name: CardName,
    pub location: ShahrazadZoneId,
}

impl ShahrazadCard {
    pub fn migrate(&mut self, id: ShahrazadZoneId) {
        self.location = id;
    }
}
