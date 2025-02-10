use serde::{Deserialize, Serialize};
use type_reflect::*;

use super::{
    card::{ShahrazadCardId, ShahrazadCardState},
    game::ShahrazadPlaymatId,
    player::ShahrazadPlayer,
    ws::CompactString,
    zone::ShahrazadZoneId,
};

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, PartialEq)]
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

impl CompactString for ShahrazadAction {
    fn to_compact(&self) -> String {
        match self {
            ShahrazadAction::DrawBottom {
                amount,
                source,
                destination,
                state,
            } => format!(
                "DB|{}|{}|{}|{}",
                amount,
                source.to_compact(),
                destination.to_compact(),
                state.to_compact()
            ),
            ShahrazadAction::DrawTop {
                amount,
                source,
                destination,
                state,
            } => format!(
                "DT|{}|{}|{}|{}",
                amount,
                source.to_compact(),
                destination.to_compact(),
                state.to_compact()
            ),
            ShahrazadAction::CardState { cards, state } => format!(
                "CS|{}|{}",
                cards
                    .iter()
                    .map(|c| c.to_compact())
                    .collect::<Vec<_>>()
                    .join(","),
                state.to_compact()
            ),
            ShahrazadAction::CardZone {
                cards,
                state,
                destination,
                index,
            } => format!(
                "CZ|{}|{}|{}|{}",
                cards
                    .iter()
                    .map(|c| c.to_compact())
                    .collect::<Vec<_>>()
                    .join(","),
                state.to_compact(),
                destination.to_compact(),
                index
            ),
            ShahrazadAction::Shuffle { zone, seed } => format!("SH|{}|{}", zone.to_compact(), seed),
            ShahrazadAction::ZoneImport {
                zone,
                cards,
                token,
                player_id,
            } => format!(
                "ZI|{}|{}|{}|{}",
                zone.to_compact(),
                cards.join(","),
                token.map_or("n".to_string(), |t| if t { "t" } else { "f" }.to_string()),
                player_id.to_compact()
            ),
            ShahrazadAction::DeckImport {
                deck_uri,
                player_id,
            } => format!("DI|{}|{}", deck_uri, player_id.to_compact()),
            ShahrazadAction::SetPlayer { player_id, player } => {
                format!("SP|{}|{}", player_id.to_compact(), player.to_compact())
            }
            ShahrazadAction::AddPlayer { player_id, player } => {
                format!("AP|{}|{}", player_id.to_compact(), player.to_compact())
            }
            ShahrazadAction::SetLife { player_id, life } => {
                format!("SL|{}|{}", player_id.to_compact(), life)
            }
            ShahrazadAction::SetCommand {
                player_id,
                command_id,
                damage,
            } => format!(
                "SC|{}|{}|{}",
                player_id.to_compact(),
                command_id.to_compact(),
                damage
            ),
            ShahrazadAction::ClearBoard { player_id } => format!("CB|{}", player_id.to_compact()),
            ShahrazadAction::DeleteToken { cards } => format!(
                "DK|{}",
                cards
                    .iter()
                    .map(|c| c.to_compact())
                    .collect::<Vec<_>>()
                    .join(",")
            ),
            ShahrazadAction::Mulligan { player_id, seed } => {
                format!("MG|{}|{}", player_id.to_compact(), seed)
            }
            ShahrazadAction::GameTerminated => "GT".to_string(),
        }
    }

    fn from_compact(s: &str) -> Result<Self, &'static str> {
        let parts: Vec<&str> = s.split('|').collect();
        let Some(action_type) = parts.get(0) else {
            return Err("Empty string is invalid");
        };
        if action_type.len() != 2 {
            return Err("Invalid Action Type");
        }
        return match action_type {
            &"DB" => Ok(ShahrazadAction::DrawBottom {
                amount: parts
                    .get(1)
                    .ok_or("Missing amount")?
                    .parse()
                    .map_err(|_| "Invalid amount")?,
                source: CompactString::from_compact(parts.get(2).ok_or("Missing source")?)?,
                destination: CompactString::from_compact(
                    parts.get(3).ok_or("Missing destination")?,
                )?,
                state: CompactString::from_compact(parts.get(4).ok_or("Missing state")?)?,
            }),
            &"DT" => Ok(ShahrazadAction::DrawTop {
                amount: parts
                    .get(1)
                    .ok_or("Missing amount")?
                    .parse()
                    .map_err(|_| "Invalid amount")?,
                source: CompactString::from_compact(parts.get(2).ok_or("Missing source")?)?,
                destination: CompactString::from_compact(
                    parts.get(3).ok_or("Missing destination")?,
                )?,
                state: CompactString::from_compact(parts.get(4).ok_or("Missing state")?)?,
            }),
            &"CS" => {
                let cards_str = parts.get(1).ok_or("Missing cards")?;
                let cards = if cards_str.is_empty() {
                    vec![]
                } else {
                    cards_str
                        .split(',')
                        .map(CompactString::from_compact)
                        .collect::<Result<Vec<_>, _>>()?
                };
                Ok(ShahrazadAction::CardState {
                    cards,
                    state: CompactString::from_compact(parts.get(2).ok_or("Missing state")?)?,
                })
            }
            &"CZ" => {
                let cards_str = parts.get(1).ok_or("Missing cards")?;
                let cards = if cards_str.is_empty() {
                    vec![]
                } else {
                    cards_str
                        .split(',')
                        .map(CompactString::from_compact)
                        .collect::<Result<Vec<_>, _>>()?
                };
                Ok(ShahrazadAction::CardZone {
                    cards,
                    state: CompactString::from_compact(parts.get(2).ok_or("Missing state")?)?,
                    destination: CompactString::from_compact(
                        parts.get(3).ok_or("Missing destination")?,
                    )?,
                    index: parts
                        .get(4)
                        .ok_or("Missing index")?
                        .parse()
                        .map_err(|_| "Invalid index")?,
                })
            }
            &"SH" => Ok(ShahrazadAction::Shuffle {
                zone: CompactString::from_compact(parts.get(1).ok_or("Missing zone")?)?,
                seed: parts.get(2).ok_or("Missing seed")?.to_string(),
            }),
            &"ZI" => {
                let cards_str = parts.get(2).ok_or("Missing cards")?;
                let cards = if cards_str.is_empty() {
                    vec![]
                } else {
                    cards_str.split(',').map(|s| s.to_string()).collect()
                };
                let token = match parts.get(3).ok_or("Missing token flag")? {
                    &"t" => Some(true),
                    &"f" => Some(false),
                    &"n" => None,
                    _ => return Err("Invalid token flag"),
                };
                Ok(ShahrazadAction::ZoneImport {
                    zone: CompactString::from_compact(parts.get(1).ok_or("Missing zone")?)?,
                    cards,
                    token,
                    player_id: CompactString::from_compact(
                        parts.get(4).ok_or("Missing player id")?,
                    )?,
                })
            }
            &"DI" => Ok(ShahrazadAction::DeckImport {
                deck_uri: parts.get(1).ok_or("Missing deck URI")?.to_string(),
                player_id: CompactString::from_compact(parts.get(2).ok_or("Missing player id")?)?,
            }),
            &"SP" => Ok(ShahrazadAction::SetPlayer {
                player_id: CompactString::from_compact(parts.get(1).ok_or("Missing player id")?)?,
                player: CompactString::from_compact(parts.get(2).ok_or("Missing player")?)?,
            }),
            &"AP" => Ok(ShahrazadAction::AddPlayer {
                player_id: CompactString::from_compact(parts.get(1).ok_or("Missing player id")?)?,
                player: CompactString::from_compact(parts.get(2).ok_or("Missing player")?)?,
            }),
            &"SL" => Ok(ShahrazadAction::SetLife {
                player_id: CompactString::from_compact(parts.get(1).ok_or("Missing player id")?)?,
                life: parts
                    .get(2)
                    .ok_or("Missing life")?
                    .parse()
                    .map_err(|_| "Invalid life value")?,
            }),
            &"SC" => Ok(ShahrazadAction::SetCommand {
                player_id: CompactString::from_compact(parts.get(1).ok_or("Missing player id")?)?,
                command_id: CompactString::from_compact(parts.get(2).ok_or("Missing command id")?)?,
                damage: parts
                    .get(3)
                    .ok_or("Missing damage")?
                    .parse()
                    .map_err(|_| "Invalid damage value")?,
            }),
            &"CB" => Ok(ShahrazadAction::ClearBoard {
                player_id: CompactString::from_compact(parts.get(1).ok_or("Missing player id")?)?,
            }),
            &"DK" => {
                let cards_str = parts.get(1).ok_or("Missing cards")?;
                let cards = if cards_str.is_empty() {
                    vec![]
                } else {
                    cards_str
                        .split(',')
                        .map(CompactString::from_compact)
                        .collect::<Result<Vec<_>, _>>()?
                };
                Ok(ShahrazadAction::DeleteToken { cards })
            }
            &"MG" => Ok(ShahrazadAction::Mulligan {
                player_id: CompactString::from_compact(parts.get(1).ok_or("Missing player id")?)?,
                seed: parts.get(2).ok_or("Missing seed")?.to_string(),
            }),
            &"GT" => Ok(ShahrazadAction::GameTerminated),
            _ => Err("Unknown action type"),
        };
    }
}
