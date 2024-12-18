use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{branded_string, types::card::ShahrazadCardId};

// zone.rs
branded_string!(ShahrazadZoneId);

#[derive(TS, Serialize, Deserialize, Clone, Debug)]
#[ts(export)]
pub struct ShahrazadZone {
    pub cards: Vec<ShahrazadCardId>,
}
