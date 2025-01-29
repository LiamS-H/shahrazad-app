use serde::{Deserialize, Serialize};
use type_reflect::*;

use crate::{branded_string, types::zone::ShahrazadZoneId};

use super::game::ShahrazadPlaymatId;

branded_string!(ShahrazadCardId);
branded_string!(ShahrazadCardName);

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, Default, PartialEq, Hash)]
pub struct ShahrazadCounter {
    pub amount: i16,
}

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, Default, PartialEq)]
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

impl std::hash::Hash for ShahrazadCardState {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        // self.inverted.hash(state);
        // self.flipped.hash(state);
        // self.tapped.hash(state);
        // self.face_down.hash(state);
        // self.revealed.hash(state);
        // self.x.hash(state);
        // self.y.hash(state);
        // self.counters.hash(state);

        if let Some(inverted) = self.inverted {
            inverted.hash(state);
        }
        if let Some(flipped) = self.flipped {
            flipped.hash(state);
        }
        if let Some(tapped) = self.tapped {
            tapped.hash(state);
        }
        if let Some(face_down) = self.face_down {
            face_down.hash(state);
        }
        if let Some(x) = self.x {
            x.hash(state);
        }
        if let Some(y) = self.y {
            y.hash(state);
        }
        if let Some(counters) = &self.counters {
            for counter in counters {
                counter.hash(state);
            }
        }
        if let Some(revealed) = &self.revealed {
            for player_id in revealed {
                player_id.hash(state);
            }
        }
    }
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
                if new_revealed.len() > 0 {
                    for player in new_revealed.clone() {
                        if !revealed.contains(&player) {
                            revealed.push(player);
                        };
                    }
                    return;
                }
            }
            self.revealed = Some(new_revealed.clone());
        }
    }
}

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct ShahrazadCard {
    pub state: ShahrazadCardState,
    pub card_name: ShahrazadCardName,
    pub location: ShahrazadZoneId,
    pub owner: ShahrazadPlaymatId,
    pub token: bool,
}

impl std::hash::Hash for ShahrazadCard {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.state.hash(state);
        self.card_name.hash(state);
        self.location.hash(state);
        self.owner.hash(state);
        self.token.hash(state);
    }
}

impl ShahrazadCard {
    pub fn migrate(&mut self, id: ShahrazadZoneId) {
        self.location = id;
    }
}
