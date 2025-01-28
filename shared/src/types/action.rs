use serde::{Deserialize, Serialize};
use type_reflect::*;

use super::{card::*, game::ShahrazadPlaymatId, player::ShahrazadPlayer, zone::*};

#[derive(Reflect, Serialize, Deserialize, Clone, Debug)]
#[serde(tag = "type")]
pub enum ShahrazadAction {
    DrawBottom {
        amount: usize,
        source: ShahrazadZoneId,
        destination: ShahrazadZoneId,
        state: ShahrazadCardState,
    },
    DrawTop {
        amount: usize,
        source: ShahrazadZoneId,
        destination: ShahrazadZoneId,
        state: ShahrazadCardState,
    },
    CardState {
        cards: Vec<ShahrazadCardId>,
        state: ShahrazadCardState,
    },
    CardZone {
        cards: Vec<ShahrazadCardId>,
        state: ShahrazadCardState,
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
        token: Option<bool>,
        player_id: ShahrazadPlaymatId,
    },
    DeckImport {
        deck_uri: String,
        player_id: ShahrazadPlaymatId,
    },
    SetPlayer {
        player_id: ShahrazadPlaymatId,
        player: ShahrazadPlayer,
    },
    AddPlayer {
        player_id: ShahrazadPlaymatId,
        player: ShahrazadPlayer,
    },
    SetLife {
        player_id: ShahrazadPlaymatId,
        life: i32,
    },
    SetCommand {
        player_id: ShahrazadPlaymatId,
        command_id: ShahrazadPlaymatId,
        damage: i32,
    },
    ClearBoard {
        player_id: ShahrazadPlaymatId,
    },
    DeleteToken {
        cards: Vec<ShahrazadCardId>,
    },
    Mulligan {
        player_id: ShahrazadPlaymatId,
        seed: String,
    },
    GameTerminated,
}
