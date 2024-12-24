use std::collections::{HashMap, HashSet};

use serde::{Deserialize, Serialize};
use type_reflect::*;

use super::{card::*, zone::*};

#[derive(Reflect, Serialize, Deserialize, Clone, Debug)]
pub struct ShahrazadGame {
    zone_count: u8,
    card_count: u8,
    cards: HashMap<ShahrazadCardId, ShahrazadCard>,
    zones: HashMap<ShahrazadZoneId, ShahrazadZone>,
    playmats: Vec<ShahrazadPlaymat>,
}

use super::zone::ShahrazadZoneId;

#[derive(Reflect, Serialize, Deserialize, Clone, Debug)]
pub struct ShahrazadPlaymat {
    library: ShahrazadZoneId,
    hand: ShahrazadZoneId,
    graveyard: ShahrazadZoneId,
    battlefield: ShahrazadZoneId,
    exile: ShahrazadZoneId,
    command: ShahrazadZoneId,
}

use crate::types::action::ShahrazadAction;

impl ShahrazadGame {
    pub fn new() -> Self {
        Self {
            zone_count: 0,
            card_count: 0,
            cards: HashMap::new(),
            zones: HashMap::new(),
            playmats: Vec::new(),
        }
    }

    pub fn apply_action(
        action: ShahrazadAction,
        game: &mut ShahrazadGame,
    ) -> Option<&mut ShahrazadGame> {
        match action {
            ShahrazadAction::DrawBottom {
                amount,
                source,
                destination,
            } => todo!(),
            ShahrazadAction::DrawTop {
                amount,
                source,
                destination,
            } => {
                if amount == 0 {
                    return None;
                }
                let src_range = ..&game.zones.get(&source)?.cards.len() - amount;
                let mut drawn_cards: Vec<ShahrazadCardId> = game
                    .zones
                    .get_mut(&source)?
                    .cards
                    .drain(src_range)
                    .collect();

                game.zones
                    .get_mut(&destination)?
                    .cards
                    .append(&mut drawn_cards);

                return Some(game);
            }
            ShahrazadAction::CardState { cards, state } => {
                let mut mutatated = false;
                for card_id in &cards {
                    let old_card = game.cards.get(&card_id)?;
                    let mut new_card = ShahrazadCard { ..old_card.clone() };
                    new_card.state.apply(&old_card.state);
                    new_card.state.apply(&state);
                    if *old_card == new_card {
                        continue;
                    };
                    mutatated = true;
                    game.cards.insert(card_id.clone(), new_card);
                }
                if !mutatated {
                    return None;
                }
                return Some(game);
            }
            ShahrazadAction::CardZone {
                cards,
                state,
                source: src,
                destination: dest,
                index,
            } => {
                let mut mutatated = false;
                for card_id in &cards {
                    let old_card = game.cards.get(&card_id)?;

                    let mut new_card = ShahrazadCard { ..old_card.clone() };
                    new_card.state.apply(&old_card.state);
                    new_card.state.apply(&state);
                    new_card.migrate(dest.clone());
                    if *old_card == new_card {
                        continue;
                    };
                    mutatated = true;
                    game.cards.insert(card_id.clone(), new_card);
                }

                let cards_set: HashSet<ShahrazadCardId> = cards.into_iter().collect();
                // could potentially check if src contains card first (not just assume is does)
                {
                    // remove cards from src
                    game.zones
                        .get_mut(&src)?
                        .cards
                        .retain(|id| !cards_set.contains(id));
                }
                let old_cards = game.zones[&dest].cards.clone();

                if old_cards.iter().any(|id| cards_set.contains(id)) {
                    return None;
                }
                let idx = if index == -1 {
                    old_cards.len() as usize
                } else {
                    index as usize
                };

                let mut new_cards = old_cards.clone();
                new_cards.splice(idx..idx, cards_set);

                mutatated = mutatated || old_cards != new_cards;

                if !mutatated {
                    return None;
                }

                game.zones.get_mut(&dest)?.cards = new_cards;

                return Some(game);
            }
            ShahrazadAction::Shuffle { zone, seed } => todo!(),
            ShahrazadAction::ZoneImport { zone, cards } => {
                for card in cards {
                    let card_name = ShahrazadCardName::new(card);
                    game.zone_count += 1;
                    let card_id: ShahrazadCardId =
                        ShahrazadCardId::new(format!("CARD_{}", game.zone_count));
                    game.cards.insert(
                        card_id,
                        ShahrazadCard {
                            card_name,
                            location: zone.clone(),
                            state: ShahrazadCardOptions {
                                face_down: Some(true),
                                inverted: Some(false),
                                flipped: Some(false),
                                tapped: Some(false),
                                x: None,
                                y: None,
                            },
                        },
                    );
                }
                return Some(game);
            }
            ShahrazadAction::DeckImport {
                deck_uri,
                player_idx,
            } => todo!(),
            ShahrazadAction::AddPlayer => {
                let zone_types = [
                    "library",
                    "hand",
                    "graveyard",
                    "battlefield",
                    "exile",
                    "command",
                ];
                let mut zone_ids = Vec::new();

                for (index, _) in zone_types.iter().enumerate() {
                    let zone_id =
                        ShahrazadZoneId::new(format!("ZONE_{}", game.zone_count + index as u8 + 1));
                    game.zones.insert(
                        zone_id.clone(),
                        ShahrazadZone {
                            cards: Vec::<ShahrazadCardId>::new(),
                        },
                    );
                    zone_ids.push(zone_id);
                }

                let new_playmat = ShahrazadPlaymat {
                    library: zone_ids[0].clone(),
                    hand: zone_ids[1].clone(),
                    graveyard: zone_ids[2].clone(),
                    battlefield: zone_ids[3].clone(),
                    exile: zone_ids[4].clone(),
                    command: zone_ids[5].clone(),
                };

                game.playmats.push(new_playmat);

                return Some(game);
            }
        }
    }
}
