use serde::{Deserialize, Serialize};
use ts_rs::TS;

use super::{card::*, zone::*};

#[derive(TS, Serialize, Deserialize, Clone, Debug)]
#[ts(export)]
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
    AddPlayer,
}
