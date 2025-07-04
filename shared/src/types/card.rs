// use crate::types::ws::ProtoSerialize;
use serde::{Deserialize, Serialize};
use type_reflect::*;

use crate::proto;
use crate::{branded_string, types::zone::ShahrazadZoneId};

use super::game::ShahrazadPlaymatId;

branded_string!(ShahrazadCardId);
branded_string!(ShahrazadCardName);

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, Default, PartialEq, Hash)]
pub struct ShahrazadCounter {
    pub amount: i32,
}

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, Default, PartialEq)]
pub struct ShahrazadCardState {
    pub inverted: Option<bool>,
    pub flipped: Option<bool>,
    pub tapped: Option<bool>,
    pub face_down: Option<bool>,
    pub revealed: Option<Vec<ShahrazadPlaymatId>>,
    pub x: Option<u32>,
    pub y: Option<u32>,
    pub counters: Option<Vec<ShahrazadCounter>>,
    pub annotation: Option<String>,
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
        if let Some(annotation) = &self.annotation {
            annotation.hash(state);
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
        if let Some(annotation) = &other.annotation {
            self.annotation = Some(annotation.clone());
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

impl From<proto::card::ShahrazadCard> for ShahrazadCard {
    fn from(value: proto::card::ShahrazadCard) -> Self {
        ShahrazadCard {
            state: if let Some(s) = value.state {
                s.into()
            } else {
                panic!()
            },
            card_name: value.card_name.into(),
            location: value.location.into(),
            owner: value.owner.into(),
            token: value.token,
        }
    }
}
impl From<ShahrazadCard> for proto::card::ShahrazadCard {
    fn from(value: ShahrazadCard) -> Self {
        proto::card::ShahrazadCard {
            card_name: value.card_name.into(),
            location: value.location.into(),
            token: value.token,
            state: Some(value.state.into()),
            owner: value.owner.into(),
        }
    }
}

impl From<proto::card::ShahrazadCounter> for ShahrazadCounter {
    fn from(value: proto::card::ShahrazadCounter) -> Self {
        ShahrazadCounter {
            amount: value.count,
        }
    }
}
impl From<ShahrazadCounter> for proto::card::ShahrazadCounter {
    fn from(value: ShahrazadCounter) -> Self {
        proto::card::ShahrazadCounter {
            counter_type: "".into(),
            count: value.amount,
        }
    }
}

impl From<proto::card::ShahrazadCardState> for ShahrazadCardState {
    fn from(value: proto::card::ShahrazadCardState) -> Self {
        let revealed = if value.revealed.len() == 0 && !value.has_revealed {
            None
        } else {
            Some(value.revealed.iter().map(|s| (s.clone()).into()).collect())
        };
        let counters = if value.counters.len() == 0 && !value.has_counters {
            None
        } else {
            Some(value.counters.iter().map(|c| (c.clone()).into()).collect())
        };

        ShahrazadCardState {
            counters,
            inverted: value.inverted,
            flipped: value.flipped,
            tapped: value.tapped,
            face_down: value.face_down,
            revealed,
            x: if value.x <= 255 { Some(value.x) } else { None },
            y: if value.y <= 255 { Some(value.y) } else { None },
            annotation: value.annotation,
        }
    }
}

impl From<ShahrazadCardState> for proto::card::ShahrazadCardState {
    fn from(value: ShahrazadCardState) -> Self {
        let mut has_counters = true;
        let counters = if let Some(c) = value.counters {
            c.iter()
                .map(|c| proto::card::ShahrazadCounter::from(c.clone()))
                .collect::<Vec<proto::card::ShahrazadCounter>>()
        } else {
            has_counters = false;
            [].into()
        };
        let mut has_revealed = true;
        let revealed = if let Some(c) = value.revealed {
            c.iter().map(|p| p.clone().into()).collect()
        } else {
            has_revealed = false;
            [].into()
        };
        proto::card::ShahrazadCardState {
            counters,
            flipped: value.flipped,
            inverted: value.inverted,
            tapped: value.tapped,
            face_down: value.face_down,
            has_revealed,
            has_counters,
            revealed,
            x: value.x.unwrap_or(255 + 1),
            y: value.y.unwrap_or(255 + 1),
            annotation: value.annotation,
        }
    }
}
