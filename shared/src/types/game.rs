use std::cmp::{max, min};
use std::collections::{HashMap, HashSet};

use rand::seq::SliceRandom;
use rand::SeedableRng;
use rand_chacha::ChaCha8Rng;
use serde::{Deserialize, Serialize};
use type_reflect::*;

use super::player::ShahrazadPlayer;
use super::{card::*, zone::*};

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct ShahrazadGame {
    zone_count: u64,
    card_count: u64,
    cards: HashMap<ShahrazadCardId, ShahrazadCard>,
    zones: HashMap<ShahrazadZoneId, ShahrazadZone>,
    playmats: HashMap<ShahrazadPlaymatId, ShahrazadPlaymat>,
    players: Vec<ShahrazadPlaymatId>,
    settings: ShahrazadGameSettings,
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
    life: i32,
    mulligans: u8,
    player: ShahrazadPlayer,
}

use crate::branded_string;
use crate::types::action::ShahrazadAction;

#[derive(Reflect, Deserialize, Serialize, Clone, Debug, PartialEq)]
pub struct ShahrazadGameSettings {
    pub starting_life: i32,
    pub free_mulligans: String,
    pub scry_rule: bool,
}

impl ShahrazadGame {
    pub fn new(settings: ShahrazadGameSettings) -> Self {
        Self {
            zone_count: 0,
            card_count: 0,
            cards: HashMap::new(),
            zones: HashMap::new(),
            playmats: HashMap::new(),
            players: Vec::new(),
            settings,
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
                state,
            } => {
                todo!("{}{}{}{:?}", amount, source, destination, state)
            }
            ShahrazadAction::DrawTop {
                amount,
                source,
                destination,
                state,
            } => {
                if amount == 0 {
                    return None;
                }
                let src_len = game.zones.get(&source)?.cards.len();
                if src_len == 0 {
                    return None;
                }
                let src_range = if src_len >= amount {
                    (src_len - amount)..
                } else {
                    src_len..
                };
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
                    card.state.apply(&state);
                }

                game.zones
                    .get_mut(&destination)?
                    .cards
                    .append(&mut drawn_cards);
                return Some(game);
            }
            ShahrazadAction::CardState { cards, state } => {
                let mut mutated = false;

                struct Pos {
                    pub x: i16,
                    pub y: i16,
                }

                let transform = if let (Some(x), Some(y)) = (state.x, state.y) {
                    let Some(first_card) = game.cards.get(&cards[0]) else {
                        return None;
                    };
                    if let (Some(sx), Some(sy)) = (first_card.state.x, first_card.state.y) {
                        Some(Pos {
                            x: x as i16 - sx as i16,
                            y: y as i16 - sy as i16,
                        })
                    } else {
                        None
                    }
                } else {
                    None
                };

                for card_id in &cards {
                    let old_card = game.cards.get(&card_id)?;
                    let mut new_card = ShahrazadCard { ..old_card.clone() };

                    new_card.state.apply(&old_card.state);
                    new_card.state.apply(&state);
                    if let Some(transform) = &transform {
                        if let (Some(x), Some(y)) = (old_card.state.x, old_card.state.y) {
                            let new_x = max(min(x as i16 + transform.x, 254), 0) as u8;
                            let new_y = max(min(y as i16 + transform.y, 254), 0) as u8;
                            new_card.state.apply(&ShahrazadCardState {
                                x: Some(new_x),
                                y: Some(new_y),
                                ..Default::default()
                            })
                        }
                    }

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
                destination: dest_id,
                index,
            } => {
                let mut mutated = false;
                let dest_set: HashSet<ShahrazadCardId> =
                    game.zones.get(&dest_id)?.cards.iter().cloned().collect();

                let mut migrating_cards = HashSet::new();
                {
                    let mut migrating_zones = Vec::new();
                    for id in &cards {
                        let Some(card) = game.cards.get(id) else {
                            continue;
                        };
                        if !game.zones.contains_key(&card.location) {
                            continue;
                        };
                        migrating_zones.push(card.location.clone());

                        let mut new_card = ShahrazadCard::clone(card);
                        new_card.state.apply(&card.state);
                        new_card.state.apply(&state);
                        new_card.migrate(dest_id.clone());
                        if new_card != *card {
                            mutated = true;
                            game.cards.insert(id.clone(), new_card);
                        };
                        if !dest_set.contains(id) {
                            migrating_cards.insert(id.clone());
                        };
                    }
                    for id in &migrating_zones {
                        let Some(zone) = game.zones.get_mut(id) else {
                            continue;
                        };
                        let len = zone.cards.len();
                        zone.cards.retain(|id| !migrating_cards.contains(id));
                        if len != zone.cards.len() {
                            mutated = true;
                        }
                    }
                }

                let dest_zone = game.zones.get_mut(&dest_id)?;
                let idx = if index == -1 {
                    dest_zone.cards.len()
                } else {
                    index as usize
                };

                let original_cards = dest_zone.cards.clone();
                dest_zone
                    .cards
                    .splice(idx..idx, migrating_cards.iter().cloned());

                if dest_zone.cards != original_cards {
                    mutated = true;
                }

                if mutated {
                    Some(game)
                } else {
                    None
                }
            }
            ShahrazadAction::Shuffle { zone, seed } => {
                let zone_ref = game.zones.get_mut(&zone)?;
                if zone_ref.cards.len() == 0 {
                    return None;
                }
                let mut rng = ChaCha8Rng::seed_from_u64(seed.parse::<u64>().unwrap_or(0));
                let mut cards = zone_ref.cards.clone();
                cards.sort_by_key(|card| card.to_string());
                cards.shuffle(&mut rng);
                for card_id in &cards {
                    let card = game.cards.get_mut(card_id)?;
                    card.state.apply(&ShahrazadCardState {
                        flipped: Some(false),
                        inverted: Some(false),
                        tapped: Some(false),
                        face_down: Some(true),
                        counters: Some([].into()),
                        revealed: Some([].into()),
                        x: Some(255),
                        y: Some(255),
                    });
                }

                zone_ref.cards = cards;
                Some(game)
            }
            ShahrazadAction::ZoneImport {
                zone,
                cards,
                player_id,
                token,
            } => {
                let mut card_ids = Vec::new();
                let token = token.unwrap_or(false);
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
                            token,
                            state: ShahrazadCardState {
                                counters: Some(Vec::<ShahrazadCounter>::new()),
                                ..Default::default()
                            },
                            owner: player_id.clone(),
                        },
                    );
                }
                game.zones.get_mut(&zone)?.cards.append(&mut card_ids);
                return Some(game);
            }
            ShahrazadAction::DeckImport {
                deck_uri,
                player_id: player_idx,
            } => todo!("{}{}", deck_uri, player_idx),
            ShahrazadAction::AddPlayer { player_id, player } => {
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
                    let zone_id = ShahrazadZoneId::new(format!(
                        "ZONE_{}",
                        game.zone_count + index as u64 + 1
                    ));
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
                    life: game.settings.starting_life.clone(),
                    mulligans: 0,
                    player,
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
            ShahrazadAction::ClearBoard { player_id } => {
                let mut remove: Vec<ShahrazadCardId> = Vec::new();
                for (card_id, card) in &game.cards {
                    if card.owner == player_id {
                        remove.push(card_id.clone());
                    }
                }
                for card_id in &remove {
                    game.cards.remove(&card_id);
                }
                for (_zone_id, zone) in &mut game.zones {
                    zone.cards.retain(|card| !remove.contains(card))
                }
                Some(game)
            }
            ShahrazadAction::Mulligan { player_id, seed } => {
                {
                    let playmat = game.playmats.get_mut(&player_id)?;

                    if playmat.mulligans < game.settings.free_mulligans.parse::<u8>().unwrap_or(0) {
                        playmat.mulligans += 1;
                    };
                }
                let playmat = game.playmats.get(&player_id)?;
                let library_id = playmat.library.clone();
                let hand_id = playmat.hand.clone();

                let mut cards: Vec<ShahrazadCardId> = Vec::new();
                for (card_id, card) in &game.cards {
                    if card.owner == player_id {
                        cards.push(card_id.clone());
                    }
                }

                ShahrazadGame::apply_action(
                    ShahrazadAction::DeleteToken {
                        cards: cards.clone(),
                    },
                    game,
                );

                ShahrazadGame::apply_action(
                    ShahrazadAction::CardZone {
                        cards,
                        state: ShahrazadCardState {
                            ..Default::default()
                        },
                        destination: library_id.clone(),
                        index: 0,
                    },
                    game,
                );

                ShahrazadGame::apply_action(
                    ShahrazadAction::Shuffle {
                        zone: library_id.clone(),
                        seed,
                    },
                    game,
                );

                ShahrazadGame::apply_action(
                    ShahrazadAction::DrawTop {
                        amount: 7,
                        source: library_id,
                        destination: hand_id,
                        state: ShahrazadCardState {
                            revealed: Some([player_id].into()),
                            ..Default::default()
                        },
                    },
                    game,
                );
                Some(game)
            }
            ShahrazadAction::GameTerminated => None,
            ShahrazadAction::DeleteToken { cards } => {
                let mut mutated = false;

                let mut tokens = HashSet::new();
                let mut zones = Vec::new();

                for id in &cards {
                    let Some(card) = game.cards.get(id) else {
                        continue;
                    };
                    if !card.token {
                        continue;
                    }
                    zones.push(card.location.clone());
                    tokens.insert(id);
                    mutated = true;
                }
                for id in &tokens {
                    game.cards.remove(id);
                }

                for id in &zones {
                    let Some(zone) = game.zones.get_mut(id) else {
                        continue;
                    };
                    zone.cards.retain(|id| !tokens.contains(id));
                }

                if !mutated {
                    return None;
                }
                return Some(game);
            }
        }
    }
}
