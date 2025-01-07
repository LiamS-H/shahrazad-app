use serde::{Deserialize, Serialize};
use type_reflect::*;

use super::{card::*, game::ShahrazadPlaymatId, zone::*};

#[derive(Reflect, Serialize, Deserialize, Clone, Debug)]
#[serde(tag = "type")]
pub enum ShahrazadAction {
    DrawBottom {
        amount: usize,
        source: ShahrazadZoneId,
        destination: ShahrazadZoneId,
    },
    DrawTop {
        amount: usize,
        source: ShahrazadZoneId,
        destination: ShahrazadZoneId,
    },
    CardState {
        cards: Vec<ShahrazadCardId>,
        state: ShahrazadCardOptions,
    },
    CardZone {
        cards: Vec<ShahrazadCardId>,
        state: ShahrazadCardOptions,
        source: ShahrazadZoneId,
        destination: ShahrazadZoneId,
        index: i32,
    },
    Shuffle {
        zone: ShahrazadZoneId,
        seed: f32,
    },
    ZoneImport {
        zone: ShahrazadZoneId,
        cards: Vec<String>,
    },
    DeckImport {
        deck_uri: String,
        player_idx: u16,
    },
    AddPlayer {
        player_id: String,
    },
    SetLife {
        player_id: ShahrazadPlaymatId,
        life: u32,
    },
}
