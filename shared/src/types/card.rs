use crate::types::ws::CompactString;
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
impl CompactString for ShahrazadCounter {
    fn to_compact(&self) -> String {
        self.amount.to_string()
    }

    fn from_compact(s: &str) -> Result<Self, &'static str> {
        Ok(ShahrazadCounter {
            amount: s.parse().map_err(|_| "Invalid counter amount")?,
        })
    }
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

impl CompactString for ShahrazadCardState {
    fn to_compact(&self) -> String {
        let mut parts = Vec::new();
        if let Some(inv) = self.inverted {
            parts.push(format!("i{}", if inv { "t" } else { "f" }));
        }
        if let Some(flip) = self.flipped {
            parts.push(format!("f{}", if flip { "t" } else { "f" }));
        }
        if let Some(tap) = self.tapped {
            parts.push(format!("t{}", if tap { "t" } else { "f" }));
        }
        if let Some(fd) = self.face_down {
            parts.push(format!("d{}", if fd { "t" } else { "f" }));
        }
        if let Some(rev) = &self.revealed {
            parts.push(format!(
                "r{}",
                rev.iter()
                    .map(|id| id.to_compact())
                    .collect::<Vec<_>>()
                    .join(",")
            ));
        }
        if let Some(x) = self.x {
            parts.push(format!("x{}", x));
        }
        if let Some(y) = self.y {
            parts.push(format!("y{}", y));
        }
        if let Some(counters) = &self.counters {
            parts.push(format!(
                "c{}",
                counters
                    .iter()
                    .map(|c| c.to_compact())
                    .collect::<Vec<_>>()
                    .join(",")
            ));
        }
        parts.join(";")
    }

    fn from_compact(s: &str) -> Result<Self, &'static str> {
        let mut state = ShahrazadCardState {
            inverted: None,
            flipped: None,
            tapped: None,
            face_down: None,
            revealed: None,
            x: None,
            y: None,
            counters: None,
        };

        for part in s.split(';') {
            if part.is_empty() {
                continue;
            }
            let (code, value) = part.split_at(1);
            match code {
                "i" => state.inverted = Some(value == "t"),
                "f" => state.flipped = Some(value == "t"),
                "t" => state.tapped = Some(value == "t"),
                "d" => state.face_down = Some(value == "t"),
                "r" => {
                    state.revealed = Some(
                        value
                            .split(',')
                            .map(|id| CompactString::from_compact(id).unwrap())
                            .collect(),
                    )
                }
                "x" => state.x = Some(value.parse().map_err(|_| "Invalid x coordinate")?),
                "y" => state.y = Some(value.parse().map_err(|_| "Invalid y coordinate")?),
                "c" => {
                    state.counters = Some(
                        value
                            .split(',')
                            .map(|c| CompactString::from_compact(c).unwrap())
                            .collect(),
                    )
                }
                _ => return Err("Unknown state code"),
            }
        }
        Ok(state)
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

impl CompactString for ShahrazadCard {
    fn to_compact(&self) -> String {
        format!(
            "{}|{}|{}|{}|{}",
            self.state.to_compact(),
            self.card_name.to_compact(),
            self.location.to_compact(),
            self.owner.to_compact(),
            if self.token { "t" } else { "f" }
        )
    }

    fn from_compact(s: &str) -> Result<Self, &'static str> {
        let parts: Vec<&str> = s.split('|').collect();
        if parts.len() != 5 {
            return Err("Invalid card format");
        }

        Ok(ShahrazadCard {
            state: CompactString::from_compact(parts[0])?,
            card_name: CompactString::from_compact(parts[1])?,
            location: CompactString::from_compact(parts[2])?,
            owner: CompactString::from_compact(parts[3])?,
            token: match parts[4] {
                "t" => true,
                "f" => false,
                _ => return Err("Invalid token value"),
            },
        })
    }
}
