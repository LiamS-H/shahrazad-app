use std::collections::{HashMap, HashSet};

use rand::seq::SliceRandom;
use rand::SeedableRng;
use rand_chacha::ChaCha8Rng;
use serde::{Deserialize, Serialize};
use type_reflect::*;

use super::{card::*, zone::*};

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct ShahrazadGame {
    zone_count: u8,
    card_count: u8,
    cards: HashMap<ShahrazadCardId, ShahrazadCard>,
    zones: HashMap<ShahrazadZoneId, ShahrazadZone>,
    playmats: HashMap<ShahrazadPlaymatId, ShahrazadPlaymat>,
    players: Vec<ShahrazadPlaymatId>,
}

use super::zone::ShahrazadZoneId;

branded_string!(ShahrazadPlaymatId);

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct ShahrazadPlaymat {
    library: ShahrazadZoneId,
    hand: ShahrazadZoneId,
    graveyard: ShahrazadZoneId,
    battlefield: ShahrazadZoneId,
    exile: ShahrazadZoneId,
    command: ShahrazadZoneId,
    life: u32,
}

use crate::branded_string;
use crate::types::action::ShahrazadAction;

impl ShahrazadGame {
    pub fn new() -> Self {
        Self {
            zone_count: 0,
            card_count: 0,
            cards: HashMap::new(),
            zones: HashMap::new(),
            playmats: HashMap::new(),
            players: Vec::new(),
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
            } => todo!("{}{}{}", amount, source, destination),
            ShahrazadAction::DrawTop {
                amount,
                source,
                destination,
            } => {
                if amount == 0 {
                    return None;
                }
                let src_len = game.zones.get(&source)?.cards.len();
                let src_range = (src_len - amount)..; // Take the last 'amount' cards
                let mut drawn_cards: Vec<ShahrazadCardId> = game
                    .zones
                    .get_mut(&source)?
                    .cards
                    .drain(src_range)
                    .collect();

                for card in &drawn_cards {
                    let Some(card) = game.cards.get_mut(&card) else {
                        continue;
                    };
                    card.migrate(destination.clone());
                }

                game.zones
                    .get_mut(&destination)?
                    .cards
                    .append(&mut drawn_cards);
                return Some(game);
            }
            ShahrazadAction::CardState { cards, state } => {
                let mut mutated = false;
                for card_id in &cards {
                    let old_card = game.cards.get(&card_id)?;
                    let mut new_card = ShahrazadCard { ..old_card.clone() };
                    new_card.state.apply(&old_card.state);
                    new_card.state.apply(&state);
                    if *old_card == new_card {
                        continue;
                    };
                    mutated = true;
                    game.cards.insert(card_id.clone(), new_card);
                }
                if !mutated {
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
                let mut mutated = false;

                let cards_set: HashSet<ShahrazadCardId> = cards.iter().cloned().collect();

                if src != dest
                    && game.zones[&dest]
                        .cards
                        .iter()
                        .any(|id| cards_set.contains(id))
                {
                    return None;
                }

                for card_id in &cards {
                    let old_card = game.cards.get(card_id)?;
                    let mut new_card = ShahrazadCard::clone(old_card);
                    new_card.state.apply(&old_card.state);
                    new_card.state.apply(&state);
                    new_card.migrate(dest.clone());

                    if new_card != *old_card {
                        mutated = true;
                        game.cards.insert(card_id.clone(), new_card);
                    }
                }

                if src == dest {
                    let zone = game.zones.get_mut(&src)?;
                    let mut new_order: Vec<ShahrazadCardId> = zone
                        .cards
                        .iter()
                        .filter(|id| !cards_set.contains(id))
                        .cloned()
                        .collect();

                    let insert_idx = if index == -1 {
                        new_order.len()
                    } else {
                        index as usize
                    };

                    new_order.splice(insert_idx..insert_idx, cards_set.iter().cloned());

                    if new_order != zone.cards {
                        mutated = true;
                        zone.cards = new_order;
                    }
                } else {
                    {
                        let source_zone = game.zones.get_mut(&src)?;
                        let original_len = source_zone.cards.len();
                        source_zone.cards.retain(|id| !cards_set.contains(id));
                        if source_zone.cards.len() != original_len {
                            mutated = true;
                        }
                    }

                    let dest_zone = game.zones.get_mut(&dest)?;
                    let idx = if index == -1 {
                        dest_zone.cards.len()
                    } else {
                        index as usize
                    };

                    let original_cards = dest_zone.cards.clone();
                    dest_zone.cards.splice(idx..idx, cards_set.iter().cloned());

                    if dest_zone.cards != original_cards {
                        mutated = true;
                    }
                }

                if mutated {
                    Some(game)
                } else {
                    None
                }
            }
            ShahrazadAction::Shuffle { zone, seed } => {
                let zone_ref = game.zones.get_mut(&zone)?;
                let mut rng = ChaCha8Rng::seed_from_u64(seed.parse::<u64>().unwrap_or(0));
                let mut cards = zone_ref.cards.clone();
                cards.shuffle(&mut rng);
                for card_id in &cards {
                    let card = game.cards.get_mut(card_id)?;
                    card.state.apply(&ShahrazadCardOptions {
                        face_down: Some(true),
                        inverted: Some(false),
                        flipped: Some(false),
                        tapped: Some(false),
                        x: None,
                        y: None,
                        counters: Some(Vec::<ShahrazadCounter>::new()),
                    });
                }

                zone_ref.cards = cards;
                Some(game)
            }
            ShahrazadAction::ZoneImport { zone, cards } => {
                let mut card_ids = Vec::new();
                for card in cards {
                    let card_name = ShahrazadCardName::new(card);
                    game.card_count += 1;
                    let card_id: ShahrazadCardId =
                        ShahrazadCardId::new(format!("CARD_{}", game.card_count));
                    card_ids.push(card_id.clone());
                    game.cards.insert(
                        card_id,
                        ShahrazadCard {
                            card_name,
                            location: zone.clone(),
                            state: ShahrazadCardOptions {
                                face_down: Some(false),
                                inverted: Some(false),
                                flipped: Some(false),
                                tapped: Some(false),
                                x: None,
                                y: None,
                                counters: Some(Vec::<ShahrazadCounter>::new()),
                            },
                        },
                    );
                }
                game.zones.get_mut(&zone)?.cards.append(&mut card_ids);
                return Some(game);
            }
            ShahrazadAction::DeckImport {
                deck_uri,
                player_idx,
            } => todo!("{}{}", deck_uri, player_idx),
            ShahrazadAction::AddPlayer { player_id } => {
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
                    life: 20,
                };

                game.zone_count += 6;

                let player_uuid = ShahrazadPlaymatId::new(player_id);

                game.playmats.insert(player_uuid.clone(), new_playmat);

                game.players.push(player_uuid.clone());

                return Some(game);
            }
            ShahrazadAction::SetLife { player_id, life } => {
                let playmat = game.playmats.get_mut(&player_id)?;
                playmat.life = life;
                Some(game)
            }
        }
    }
}
