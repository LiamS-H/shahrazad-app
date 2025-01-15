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
        seed: String,
    },
    ZoneImport {
        zone: ShahrazadZoneId,
        cards: Vec<String>,
        player_id: ShahrazadPlaymatId,
    },
    DeckImport {
        deck_uri: String,
        player_id: ShahrazadPlaymatId,
    },
    AddPlayer {
        player_id: String,
    },
    SetLife {
        player_id: ShahrazadPlaymatId,
        life: u32,
    },
    ClearBoard {
        player_id: ShahrazadPlaymatId,
    },
    Mulligan {
        player_id: ShahrazadPlaymatId,
        seed: String,
    },
}
