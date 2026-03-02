// use crate::types::ws::ProtoSerialize;
use std::cmp::{max, min};
use std::collections::{ HashSet, VecDeque};
use std::hash::{Hash, Hasher};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use prost::Message;
use rand::seq::SliceRandom;
use rand::SeedableRng;
use rand_chacha::ChaCha8Rng;
use seahash::SeaHasher;
use serde::{Deserialize, Serialize};
use type_reflect::*;

use super::action::CardImport;
use super::ws::ProtoSerialize;
use super::{card::*, zone::*};

use super::playmat::ShahrazadPlaymat;
use crate::proto;
use crate::types::action::ShahrazadAction;
use crate::types::playmat::{CommandDammage, ShahrazadPlaymatId};

#[path = "../tests/game_internal.rs"]
mod game_internal;
#[path = "../tests/reset_playmat.rs"]
mod reset_playmat;

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct ShahrazadGame {
    zone_count: usize,
    card_count: usize,
    cards: Vec<ShahrazadCard>,
    zones: Vec<ShahrazadZone>,
    playmats: Vec<ShahrazadPlaymat>,
    players: Vec<ShahrazadPlaymatId>,
    settings: ShahrazadGameSettings,
    created_at: u64,
    stack: ShahrazadZoneId,
}

use super::zone::ShahrazadZoneId;

#[derive(Reflect, Deserialize, Serialize, Clone, Debug, PartialEq, Hash)]
pub struct ShahrazadGameSettings {
    pub starting_life: i32,
    pub free_mulligans: i32,
    pub commander: bool,
    pub scry_rule: bool,
}

impl ShahrazadGame {
    pub fn hash(&self) -> u64 {
        let mut state = SeaHasher::with_seeds(0, 0, 0, 0);
        (self.zone_count as u32).hash(&mut state);
        (self.card_count as u32).hash(&mut state);
        for card in &self.cards {
            card.hash(&mut state);
            card.hash(&mut state);
        }

        for zone in &self.zones {
            zone.hash(&mut state);
            zone.hash(&mut state);
        }
        for player in &self.players {
            let Some(playmat) = self.playmats.get(player.0 as usize) else {
                continue;
            };
            player.hash(&mut state);
            playmat.hash(&mut state);
        }
        self.settings.hash(&mut state);
        self.created_at.hash(&mut state);

        state.finish()
    }
    pub fn new(settings: ShahrazadGameSettings) -> Self {
        return ShahrazadGame::new_time(
            settings,
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or(Duration::new(0, 0))
                .as_secs(),
        );
    }
    pub fn new_time(settings: ShahrazadGameSettings, created_at: u64) -> Self {
        Self {
            zone_count: 0,
            card_count: 0,
            cards: Vec::new(),
            zones: vec![ShahrazadZone {
                cards: Vec::new(),
                name: ZoneName::STACK,
            }] ,
            playmats: Vec::new(),
            players: Vec::new(),
            settings,
            created_at,
            stack: 0.into(),
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
                let src_len = game.zones.get(source.0 as usize)?.cards.len();
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
                    .get_mut(source.0 as usize)?
                    .cards
                    .drain(src_range)
                    .collect();

                for card in &drawn_cards {
                    let Some(card) = game.cards.get_mut(card.0 as usize) else {
                        continue;
                    };
                    card.migrate(destination.clone());
                    card.state.apply(&state);
                }

                game.zones
                    .get_mut(destination.0 as usize)?
                    .cards
                    .append(&mut drawn_cards);
                return Some(game);
            }
            ShahrazadAction::CardState { cards, state } => {
                if cards.len() == 0 {
                    return None;
                }
                let mut mutated = false;

                struct Pos {
                    pub x: i16,
                    pub y: i16,
                }

                let transform = 'transform_block: {
                    let (Some(x), Some(y)) = (state.x, state.y) else {
                        break 'transform_block None;
                    };

                    if x == 255 && y == 255 {
                        break 'transform_block None;
                    }

                    if cards.is_empty() || cards.len() == 1 {
                        break 'transform_block None;
                    }

                    let Some(first_card) = game.cards.get(cards[0].0 as usize) else {
                        break 'transform_block None;
                    };

                    let (Some(sx), Some(sy)) = (first_card.state.x, first_card.state.y) else {
                        break 'transform_block None;
                    };

                    Some(Pos {
                        x: x as i16 - sx as i16,
                        y: y as i16 - sy as i16,
                    })
                };

                for card_id in &cards {
                    let old_card = game.cards.get(card_id.0 as usize)?;
                    let mut new_card = ShahrazadCard { ..old_card.clone() };

                    new_card.state = old_card.state.clone();
                    new_card.state.apply(&state);
                    if let Some(transform) = &transform {
                        if let (Some(x), Some(y)) = (old_card.state.x, old_card.state.y) {
                            let new_x = max(min(x as i16 + transform.x, 255 - 1), 0) as u32;
                            let new_y = max(min(y as i16 + transform.y, 255 - 1), 0) as u32;
                            new_card.state.apply(&&ShahrazadCardStateTransform {
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
                    game.cards.insert(card_id.0 as usize, new_card);
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
                if cards.len() == 0 {
                    return None;
                }
                let mut mutated = false;

                let dest_zone = game.zones.get(dest_id.0 as usize)?;

                let mut tokens = Vec::new();
                let mut migrating_cards = HashSet::new();
                {
                    let mut migrating_zones = Vec::new();
                    for id in &cards {
                        let Some(card) = game.cards.get_mut(id.0 as usize) else {
                            continue;
                        };
                        if game.zones.get(card.location.0 as usize).is_none() {
                            continue;
                        };
                        migrating_zones.push(card.location.clone());
                        card.migrate(dest_id.clone());
                        migrating_cards.insert(id.clone());

                        if dest_zone.name != ZoneName::BATTLEFIELD {
                            if card.token {
                                tokens.push(id.clone());
                            }
                            if !card.commander {
                                card.state.counters = [].into();
                                card.state.annotation = "".into();
                            }
                        }
                    }

                    for id in &migrating_zones {
                        let Some(zone) = game.zones.get_mut(id.0 as usize) else {
                            continue;
                        };
                        let len = zone.cards.len();
                        zone.cards.retain(|id| !migrating_cards.contains(id));
                        if len != zone.cards.len() {
                            mutated = true;
                        }
                    }
                }

                if ShahrazadGame::apply_action(
                    ShahrazadAction::CardState {
                        cards: cards.clone(),
                        state,
                    },
                    game,
                )
                .is_some()
                {
                    mutated = true;
                };

                let dest_zone = game.zones.get_mut(dest_id.0 as usize)?;
                let idx = if index == -1 {
                    dest_zone.cards.len()
                } else {
                    index as usize
                };

                let original_cards = dest_zone.cards.clone();
                dest_zone.cards.splice(
                    idx..idx,
                    cards
                        .iter()
                        .cloned()
                        .filter(|id| migrating_cards.contains(id)),
                );

                if dest_zone.cards.len() != original_cards.len() {
                    mutated = true;
                }

                if ShahrazadGame::apply_action(ShahrazadAction::DeleteToken { cards: tokens }, game)
                    .is_some()
                {
                    mutated = true;
                };

                if mutated {
                    Some(game)
                } else {
                    None
                }
            }
            ShahrazadAction::Shuffle { zone, seed } => {
                let zone_ref = game.zones.get_mut(zone.0 as usize)?;
                if zone_ref.cards.len() == 0 {
                    return None;
                }
                let mut rng = ChaCha8Rng::seed_from_u64(seed);
                let mut cards = zone_ref.cards.clone();
                cards.sort_by_key(|card| card.to_string());
                cards.shuffle(&mut rng);
                for card_id in &cards {
                    let card = game.cards.get_mut(card_id.0 as usize)?;
                    card.state.apply(&&ShahrazadCardStateTransform::reset());
                    card.state.apply(&&ShahrazadCardStateTransform {
                        face_down: Some(true),
                        revealed: Some([].into()),
                        ..Default::default()
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
                state,
            } => {
                if cards.len() == 0 {
                    return None;
                }
                let mut card_ids = Vec::new();
                let token = token;
                let zone_name = game.zones.get(zone.0 as usize)?.name.clone();
                for CardImport { str, amount } in cards {
                    for _ in 0..(amount.unwrap_or(1)) {
                        let card_name = ShahrazadCardName::new(str.clone());
                        let card_id: ShahrazadCardId =
                            ShahrazadCardId::new(game.card_count as u32);
                        card_ids.push(card_id.clone());
                        let commander = if zone_name == ZoneName::COMMAND {
                            true
                        } else {
                            false
                        };
                        let mut card = ShahrazadCard {
                            card_name,
                            location: zone.clone(),
                            token,
                            commander,
                            state: ShahrazadCardState::default(),
                            owner: player_id.clone(),
                        };
                        card.state.apply(&state);
                        game.cards.insert(card_id.0 as usize, card);
                        game.card_count += 1;
                    }
                }
                game.zones.get_mut(zone.0 as usize)?.cards.append(&mut card_ids);
                return Some(game);
            }
            ShahrazadAction::DeckImport {
                deck_uri,
                player_id,
            } => todo!("{}{}", deck_uri, player_id),
            ShahrazadAction::SetPlayer { player_id, player } => {
                if let Some(player) = player {
                    let Some(playmat) = game.playmats.get_mut(player_id.0 as usize) else {
                        return None;
                    };
                    if playmat.player == player {
                        return None;
                    }
                    playmat.player = player;
                    return Some(game);
                };

                ShahrazadGame::apply_action(
                    ShahrazadAction::ClearBoard {
                        player_id: player_id.clone(),
                    },
                    game,
                );

                let Some(playmat) = game.playmats.get(player_id.0 as usize) else {
                    return None;
                };

                game.zones.remove(playmat.battlefield.0 as usize);
                game.zones.remove(playmat.command.0 as usize);
                game.zones.remove(playmat.exile.0 as usize);
                game.zones.remove(playmat.graveyard.0 as usize);
                game.zones.remove(playmat.hand.0 as usize);
                game.zones.remove(playmat.library.0 as usize);

                game.cards.retain(| card| card.owner != player_id);
                game.playmats.remove(player_id.0 as usize);
                game.players.retain(|p| *p != player_id);

                for player in game.players.iter() {
                    let Some(playmat) = game.playmats.get_mut(player.0 as usize) else {
                        continue;
                    };
                    playmat.command_damage.retain(|CommandDammage{playmat,damage:_}|*playmat!=player_id);
                }

                return Some(game);
            }
            ShahrazadAction::AddPlayer { player_id, player } => {
                let zone_types = [
                    ZoneName::LIBRARY,
                    ZoneName::HAND,
                    ZoneName::GRAVEYARD,
                    ZoneName::BATTLEFIELD,
                    ZoneName::EXILE,
                    ZoneName::COMMAND,
                    ZoneName::SIDEBOARD,
                ];
                let mut zone_ids = Vec::new();

                for (index, name) in zone_types.iter().enumerate() {
                    let zone_id =
                        ShahrazadZoneId::new( (game.zone_count + index + 1) as u32);
                    game.zones.insert(
                        zone_id.0 as usize,
                        ShahrazadZone {
                            cards: Vec::<ShahrazadCardId>::new(),
                            name: name.to_owned(),
                        },
                    );
                    zone_ids.push(zone_id);
                }

                game.players.push(player_id.clone());

                let mut command_damage = Vec::new();

                for player in &game.players {
                    command_damage.push(CommandDammage { playmat: player.clone(), damage: 0 });

                    let Some(playmat) = game.playmats.get_mut(player.0 as usize) else {
                        continue;
                    };
                    playmat.command_damage.push(CommandDammage { playmat: player_id.clone(), damage: 0 });
                }

                let new_playmat = ShahrazadPlaymat {
                    library: zone_ids[0].clone(),
                    hand: zone_ids[1].clone(),
                    graveyard: zone_ids[2].clone(),
                    battlefield: zone_ids[3].clone(),
                    exile: zone_ids[4].clone(),
                    command: zone_ids[5].clone(),
                    sideboard: zone_ids[6].clone(),
                    life: game.settings.starting_life.clone(),
                    mulligans: 0,
                    command_damage,
                    player,
                    reveal_deck_top: crate::types::playmat::DeckTopReveal::NONE,
                };

                game.zone_count += zone_types.len();

                game.playmats.insert(player_id.0 as usize, new_playmat);

                return Some(game);
            }
            ShahrazadAction::SetLife { player_id, life } => {
                let playmat = game.playmats.get_mut(player_id.0 as usize)?;
                if playmat.life == life {
                    return None;
                }
                playmat.life = life;
                Some(game)
            }
            ShahrazadAction::SetCommand {
                player_id,
                command_id,
                damage,
            } => {
                let playmat = game.playmats.get_mut(player_id.0 as usize)?;
                for command in & mut playmat.command_damage {
                    if command.playmat == command_id {
                        command.damage = damage;
                        break;
                    }
                }
                Some(game)
            }
            ShahrazadAction::SetPlaymat {
                player_id,
                reveal_deck_top,
            } => {
                let playmat = game.playmats.get_mut(player_id.0 as usize)?;
                let reveal_deck_top = reveal_deck_top.into();
                if playmat.reveal_deck_top == reveal_deck_top {
                    return None;
                }
                playmat.reveal_deck_top = reveal_deck_top;
                Some(game)
            }
            ShahrazadAction::ClearBoard { player_id } => {
                let mut remove: Vec<usize> = Vec::new();
                for (card_id, card) in game.cards.iter().enumerate() {
                    if card.owner == player_id {
                        remove.push(card_id.clone());
                    }
                }
                for card_id in &remove {
                    game.cards.remove(*card_id);
                }
                for (_zone_id, zone) in game.zones.iter_mut().enumerate() {
                    zone.cards.retain(|card| !remove.contains(&(card.0 as usize)))
                }
                Some(game)
            }
            ShahrazadAction::Mulligan { player_id, seed } => {
                {
                    let playmat = game.playmats.get_mut(player_id.0 as usize)?;

                    let free_mulligans = game.settings.free_mulligans as i8;

                    if free_mulligans == 5 {
                        playmat.mulligans = -1;
                    } else if playmat.mulligans <= -free_mulligans {
                        playmat.mulligans = 1;
                    } else if playmat.mulligans <= 0 {
                        playmat.mulligans -= 1;
                    } else {
                        playmat.mulligans = min(playmat.mulligans + 1, 7);
                    };
                }
                let playmat = game.playmats.get(player_id.0 as usize)?;
                let library_id = playmat.library.clone();
                let hand_id = playmat.hand.clone();
                let command_id = playmat.command.clone();
                let sideboard_id = playmat.sideboard.clone();

                let mut cards: Vec<ShahrazadCardId> = Vec::new();
                let mut commanders: Vec<ShahrazadCardId> = Vec::new();
                let mut sideboard: Vec<ShahrazadCardId> = Vec::new();
                let mut is_reset: bool = game.zones.get(hand_id.0 as usize)?.cards.len() == 0;
                for (card_id, card) in game.cards.iter().enumerate() {
                    if card.owner != player_id {
                        continue;
                    }

                    if !is_reset
                        && !(card.location == library_id
                            || card.location == hand_id
                            || card.location == command_id
                            || card.location == sideboard_id)
                    {
                        is_reset = true;
                    }
                    if card.location == sideboard_id {
                        sideboard.push(card_id.into());
                        continue;
                    };
                    if card.commander {
                        commanders.push(card_id.into());
                        continue;
                    }
                    cards.push(card_id.into());
                }
                if is_reset {
                    ShahrazadGame::apply_action(
                        ShahrazadAction::ResetPlaymat {
                            player_id: player_id.clone(),
                            seed: seed.clone(),
                        },
                        game,
                    );
                } else {
                    ShahrazadGame::apply_action(
                        ShahrazadAction::DeleteToken {
                            cards: cards.clone(),
                        },
                        game,
                    );

                    ShahrazadGame::apply_action(
                        ShahrazadAction::CardZone {
                            cards: cards.clone(),
                            state: ShahrazadCardStateTransform {
                                ..Default::default()
                            },
                            destination: library_id.clone(),
                            index: 0,
                        },
                        game,
                    );

                    ShahrazadGame::apply_action(
                        ShahrazadAction::CardZone {
                            cards: commanders,
                            state: ShahrazadCardStateTransform::reset(),
                            destination: command_id,
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
                }

                ShahrazadGame::apply_action(
                    ShahrazadAction::DrawTop {
                        amount: 7,
                        source: library_id.clone(),
                        destination: hand_id,
                        state: ShahrazadCardStateTransform {
                            revealed: Some([player_id].into()),
                            ..Default::default()
                        },
                    },
                    game,
                );
                Some(game)
            }
            ShahrazadAction::ResetPlaymat { player_id, seed } => {
                {
                    let playmat = game.playmats.get_mut(player_id.0 as usize)?;
                    playmat.mulligans = 0;
                    for command in &mut playmat.command_damage {
                        command.damage = 0;
                    }
                }

                let playmat = game.playmats.get_mut(player_id.0 as usize)?;
                playmat.life = game.settings.starting_life;
                playmat.reveal_deck_top = crate::types::playmat::DeckTopReveal::NONE;
                let library_id = playmat.library.clone();
                let command_id = playmat.command.clone();
                let sideboard_id = playmat.sideboard.clone();

                let mut cards: Vec<ShahrazadCardId> = Vec::new();
                let mut commanders: Vec<ShahrazadCardId> = Vec::new();
                let mut sideboard: Vec<ShahrazadCardId> = Vec::new();

                for (card_id, card) in game.cards.iter().enumerate() {
                    if card.owner != player_id {
                        continue;
                    }

                    if card.location == sideboard_id {
                        sideboard.push(card_id.into());
                        continue;
                    };
                    if card.commander {
                        commanders.push(card_id.into());
                        continue;
                    }
                    cards.push(card_id.into());
                }

                ShahrazadGame::apply_action(
                    ShahrazadAction::DeleteToken {
                        cards: cards.clone(),
                    },
                    game,
                );

                ShahrazadGame::apply_action(
                    ShahrazadAction::CardZone {
                        cards: cards.clone(),
                        state: ShahrazadCardStateTransform {
                            ..Default::default()
                        },
                        destination: library_id.clone(),
                        index: 0,
                    },
                    game,
                );

                ShahrazadGame::apply_action(
                    ShahrazadAction::CardZone {
                        cards: commanders,
                        state: ShahrazadCardStateTransform::reset(),
                        destination: command_id,
                        index: 0,
                    },
                    game,
                );

                ShahrazadGame::apply_action(
                    ShahrazadAction::Shuffle {
                        zone: library_id.clone(),
                        seed: seed.clone(),
                    },
                    game,
                );

                Some(game)
            }
            ShahrazadAction::SendMessage { .. } => Some(game),
            ShahrazadAction::GameTerminated => None,
            ShahrazadAction::DeleteToken { cards } => {
                let mut mutated = false;

                let mut tokens = HashSet::new();
                let mut zones = Vec::new();

                for id in &cards {
                    let Some(card) = game.cards.get(id.0 as usize) else {
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
                    game.cards.remove(id.0 as usize);
                }

                for id in &zones {
                    let Some(zone) = game.zones.get_mut(id.0 as usize) else {
                        continue;
                    };
                    zone.cards.retain(|id| !tokens.contains(id));
                }

                if !mutated {
                    return None;
                }
                return Some(game);
            }
            ShahrazadAction::SetSettings { settings } => {
                game.settings = settings;
                return Some(game);
            }
        }
    }
}

impl TryFrom<proto::game::ShahrazadGame> for ShahrazadGame {
    type Error = &'static str;

    fn try_from(value: proto::game::ShahrazadGame) -> Result<Self, Self::Error> {
        Ok(ShahrazadGame {
            zone_count: value.zone_count as usize,
            card_count: value.card_count as usize,
            cards: value
                .cards.iter().map(|c|c.clone().into()).collect(),
            zones: value
                .zones.iter().map(|c|c.clone().into()).collect(),
            playmats: value
                .playmats
                .iter()
                .map(|c|(c.clone().try_into()))
                .collect::<Result<Vec<_>,_>>()?,
            players: value.players.iter().map(|p| p.clone().into()).collect(),
            settings: value.settings.unwrap().into(),
            created_at: value.created_at,
            stack: value.stack.into(),
        })
    }
}

impl From<ShahrazadGame> for proto::game::ShahrazadGame {
    fn from(value: ShahrazadGame) -> Self {
        proto::game::ShahrazadGame {
            zone_count: value.zone_count as u32,
            card_count: value.card_count as u32,
            cards: value
                .cards.iter().map(|c|c.clone().into()).collect(),
            zones: value
                .zones.iter().map(|c|c.clone().into()).collect(),
            playmats: value
                .playmats
                .iter()
                .map(|c|(c.clone().into()))
                .collect(),
            players: value.players.iter().map(|p| p.clone().into()).collect(),
            settings: Some(value.settings.into()),
            created_at: value.created_at,
            stack: value.stack.into(),
        }
    }
}

impl From<ShahrazadGameSettings> for proto::game::ShahrazadGameSettings {
    fn from(value: ShahrazadGameSettings) -> Self {
        proto::game::ShahrazadGameSettings {
            commander: value.commander,
            free_mulligans: value.free_mulligans,
            scry_rule: value.scry_rule,
            starting_life: value.starting_life,
        }
    }
}

impl From<proto::game::ShahrazadGameSettings> for ShahrazadGameSettings {
    fn from(value: proto::game::ShahrazadGameSettings) -> Self {
        ShahrazadGameSettings {
            commander: value.commander,
            free_mulligans: value.free_mulligans,
            scry_rule: value.scry_rule,
            starting_life: value.starting_life,
        }
    }
}

impl ProtoSerialize for ShahrazadGame {
    fn encode(&self) -> Vec<u8> {
        let compact = proto::game::ShahrazadGame::from(self.clone());
        return compact.encode_to_vec();
    }

    fn decode(s: Vec<u8>) -> Result<Self, &'static str>
    where
        Self: Sized,
    {
        let buf: VecDeque<u8> = s.into();
        let compact = match proto::game::ShahrazadGame::decode(buf) {
            Ok(c) => c,
            Err(_) => return Err("protobuf decode error"),
        }
        ;
        let game: ShahrazadGame = match compact.try_into() {
            Ok(game) => game,
            Err(err) => return Err(err),
        };

        return Ok(game);
    }
}
