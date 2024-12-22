use serde::{Deserialize, Serialize};
use type_reflect::*;

use crate::{branded_string, types::card::ShahrazadCardId};

// zone.rs
branded_string!(ShahrazadZoneId);

#[derive(Reflect, Serialize, Deserialize, Clone, Debug)]
pub struct ShahrazadZone {
    pub cards: Vec<ShahrazadCardId>,
}
