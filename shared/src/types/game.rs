// use crate::types::ws::ProtoSerialize;
use std::cmp::{max, min};
use std::collections::{HashMap, HashSet, VecDeque};
use std::hash::{Hash, Hasher};

use prost::Message;
use rand::seq::SliceRandom;
use rand::SeedableRng;
use rand_chacha::ChaCha8Rng;
use seahash::SeaHasher;
use serde::{Deserialize, Serialize};
use type_reflect::*;

use super::action::CardImport;
use super::player::ShahrazadPlayer;
use super::ws::ProtoSerialize;
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
    mulligans: i8,
    command_damage: HashMap<ShahrazadPlaymatId, i32>,
    player: ShahrazadPlayer,
}

impl std::hash::Hash for ShahrazadPlaymat {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.library.hash(state);
        self.hand.hash(state);
        self.graveyard.hash(state);
        self.battlefield.hash(state);
        self.exile.hash(state);
        self.command.hash(state);
        self.life.hash(state);
        self.mulligans.hash(state);
        let mut damages: Vec<_> = self.command_damage.iter().collect();
        damages.sort_by(|a, b| a.0.cmp(b.0));
        for damage in damages {
            damage.0.hash(state);
            damage.1.hash(state);
        }
        self.player.hash(state);
    }
}

use crate::types::action::ShahrazadAction;
use crate::{branded_string, proto};

#[derive(Reflect, Deserialize, Serialize, Clone, Debug, PartialEq, Hash)]
pub struct ShahrazadGameSettings {
    pub starting_life: i32,
    pub free_mulligans: String,
    pub commander: bool,
    pub scry_rule: bool,
}

impl ShahrazadGame {
    pub fn hash(&self) -> u64 {
        let mut state = SeaHasher::with_seeds(0, 0, 0, 0);
        self.zone_count.hash(&mut state);
        self.card_count.hash(&mut state);
        let mut cards: Vec<_> = self.cards.iter().collect();
        cards.sort_by(|a, b| a.0.cmp(b.0));
        for card in cards {
            card.0.hash(&mut state);
            card.1.hash(&mut state);
        }

        let mut zones: Vec<_> = self.zones.iter().collect();
        zones.sort_by(|a, b| a.0.cmp(b.0));
        for zone in zones {
            zone.0.hash(&mut state);
            zone.1.hash(&mut state);
        }
        for player in &self.players {
            let Some(playmat) = self.playmats.get(player) else {
                continue;
            };
            player.hash(&mut state);
            playmat.hash(&mut state);
        }
        self.settings.hash(&mut state);

        state.finish()
    }
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
                            let new_x = max(min(x as i16 + transform.x, 255 - 1), 0) as u32;
                            let new_y = max(min(y as i16 + transform.y, 255 - 1), 0) as u32;
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

                let mut migrating_cards = HashSet::new();
                {
                    let mut migrating_zones = Vec::new();
                    for id in &cards {
                        let Some(card) = game.cards.get_mut(id) else {
                            continue;
                        };
                        if !game.zones.contains_key(&card.location) {
                            continue;
                        };
                        migrating_zones.push(card.location.clone());
                        card.migrate(dest_id.clone());

                        // let mut new_card = ShahrazadCard::clone(card);
                        // new_card.state.apply(&card.state);
                        // new_card.state.apply(&state);
                        // new_card.migrate(dest_id.clone());
                        // if new_card != *card {
                        //     mutated = true;
                        //     game.cards.insert(id.clone(), new_card);
                        // };
                        migrating_cards.insert(id.clone());
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

                let dest_zone = game.zones.get_mut(&dest_id)?;
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
                        annotation: Some("".into()),
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
                let mut card_ids = Vec::new();
                let token = token;
                for CardImport { str, amount } in cards {
                    for _ in 0..(amount.unwrap_or(1)) {
                        let card_name = ShahrazadCardName::new(str.clone());
                        game.card_count += 1;
                        let card_id: ShahrazadCardId =
                            ShahrazadCardId::new(format!("C{}", game.card_count));
                        card_ids.push(card_id.clone());
                        let mut card = ShahrazadCard {
                            card_name,
                            location: zone.clone(),
                            token,
                            state: ShahrazadCardState {
                                ..Default::default()
                            },
                            owner: player_id.clone(),
                        };
                        card.state.apply(&state);
                        game.cards.insert(card_id, card);
                    }
                }
                game.zones.get_mut(&zone)?.cards.append(&mut card_ids);
                return Some(game);
            }
            ShahrazadAction::DeckImport {
                deck_uri,
                player_id,
            } => todo!("{}{}", deck_uri, player_id),
            ShahrazadAction::SetPlayer { player_id, player } => {
                if let Some(player) = player {
                    let Some(playmat) = game.playmats.get_mut(&player_id) else {
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

                let Some(playmat) = game.playmats.get(&player_id) else {
                    return None;
                };

                game.zones.remove(&playmat.battlefield);
                game.zones.remove(&playmat.command);
                game.zones.remove(&playmat.exile);
                game.zones.remove(&playmat.graveyard);
                game.zones.remove(&playmat.hand);
                game.zones.remove(&playmat.library);

                game.cards.retain(|_, card| card.owner != player_id);
                game.playmats.remove(&player_id);
                game.players.retain(|p| *p != player_id);

                for player in game.players.iter() {
                    let Some(playmat) = game.playmats.get_mut(&player) else {
                        continue;
                    };
                    playmat.command_damage.remove(&player_id);
                }

                return Some(game);
            }
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
                    let zone_id =
                        ShahrazadZoneId::new(format!("Z{}", game.zone_count + index as u64 + 1));
                    game.zones.insert(
                        zone_id.clone(),
                        ShahrazadZone {
                            cards: Vec::<ShahrazadCardId>::new(),
                        },
                    );
                    zone_ids.push(zone_id);
                }

                game.players.push(player_id.clone());

                let mut command_damage = HashMap::new();

                for player in &game.players {
                    command_damage.insert(player.clone(), 0);
                    let Some(playmat) = game.playmats.get_mut(player) else {
                        continue;
                    };
                    playmat.command_damage.insert(player_id.clone(), 0);
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
                    command_damage,
                    player,
                };

                game.zone_count += 6;

                game.playmats.insert(player_id.clone(), new_playmat);

                return Some(game);
            }
            ShahrazadAction::SetLife { player_id, life } => {
                let playmat = game.playmats.get_mut(&player_id)?;
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
                let playmat = game.playmats.get_mut(&player_id)?;
                playmat.command_damage.insert(command_id, damage);
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

                    let free_mulligans = game.settings.free_mulligans.parse::<i8>().unwrap_or(0);

                    if free_mulligans == 5 {
                    } else if playmat.mulligans <= -free_mulligans {
                        playmat.mulligans = 1;
                    } else if playmat.mulligans <= 0 {
                        playmat.mulligans -= 1;
                    } else {
                        playmat.mulligans = min(playmat.mulligans + 1, 7);
                    };
                }
                let playmat = game.playmats.get(&player_id)?;
                let library_id = playmat.library.clone();
                let hand_id = playmat.hand.clone();

                let mut cards: Vec<ShahrazadCardId> = Vec::new();
                let mut is_reset: bool = game.zones.get(&playmat.hand)?.cards.len() == 0;
                for (card_id, card) in &game.cards {
                    if !is_reset
                        && !(card.location == playmat.library
                            || card.location == playmat.hand
                            || card.location == playmat.command)
                    {
                        is_reset = true;
                    }
                    if card.location == playmat.command {
                        continue;
                    }
                    if card.owner == player_id {
                        cards.push(card_id.clone());
                    }
                }
                if is_reset {
                    {
                        let playmat = game.playmats.get_mut(&player_id)?;
                        playmat.mulligans = 0;
                        for k in &game.players {
                            playmat.command_damage.insert(k.clone(), 0);
                        }
                    }
                    for player_id in &game.players {
                        let playmat = game.playmats.get_mut(player_id)?;
                        playmat.life = game.settings.starting_life;
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

impl TryFrom<proto::game::ShahrazadGame> for ShahrazadGame {
    type Error = &'static str;

    fn try_from(value: proto::game::ShahrazadGame) -> Result<Self, Self::Error> {
        Ok(ShahrazadGame {
            zone_count: value.zone_count,
            card_count: value.card_count,
            cards: value
                .cards
                .iter()
                .map(|(k, v)| (k.clone().into(), v.clone().into()))
                .collect(),
            zones: value
                .zones
                .iter()
                .map(|(k, v)| (k.clone().into(), v.clone().into()))
                .collect(),
            playmats: value
                .playmats
                .iter()
                .map(|(k, v)| (k.clone().into(), v.clone().try_into().unwrap()))
                .collect(),
            players: value.players.iter().map(|p| p.clone().into()).collect(),
            settings: value.settings.unwrap().into(),
        })
    }
}

impl From<ShahrazadGame> for proto::game::ShahrazadGame {
    fn from(value: ShahrazadGame) -> Self {
        proto::game::ShahrazadGame {
            zone_count: value.zone_count,
            card_count: value.card_count,
            cards: value
                .cards
                .iter()
                .map(|(k, v)| (k.clone().into(), v.clone().into()))
                .collect(),
            zones: value
                .zones
                .iter()
                .map(|(k, v)| (k.clone().into(), v.clone().into()))
                .collect(),
            playmats: value
                .playmats
                .iter()
                .map(|(k, v)| (k.clone().into(), v.clone().try_into().unwrap()))
                .collect(),
            players: value.players.iter().map(|p| p.clone().into()).collect(),
            settings: Some(value.settings.into()),
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

impl TryFrom<proto::playmat::ShahrazadPlaymat> for ShahrazadPlaymat {
    type Error = &'static str;

    fn try_from(value: proto::playmat::ShahrazadPlaymat) -> Result<Self, Self::Error> {
        Ok(ShahrazadPlaymat {
            library: value.library.into(),
            hand: value.hand.into(),
            graveyard: value.graveyard.into(),
            battlefield: value.battlefield.into(),
            exile: value.exile.into(),
            command: value.command.into(),
            life: value.life.into(),
            mulligans: value.mulligans.try_into().unwrap(),
            command_damage: value
                .command_damage
                .iter()
                .map(|(k, v)| (k.clone().into(), v.clone()))
                .collect(),
            player: value.player.unwrap().into(),
        })
    }
}
impl From<ShahrazadPlaymat> for proto::playmat::ShahrazadPlaymat {
    fn from(value: ShahrazadPlaymat) -> Self {
        proto::playmat::ShahrazadPlaymat {
            library: value.library.into(),
            hand: value.hand.into(),
            graveyard: value.graveyard.into(),
            battlefield: value.battlefield.into(),
            exile: value.exile.into(),
            command: value.command.into(),
            life: value.life,
            mulligans: value.mulligans.into(),
            command_damage: value
                .command_damage
                .iter()
                .map(|(k, v)| (k.clone().into(), v.clone()))
                .collect(),
            player: Some(value.player.into()),
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
        let compact = proto::game::ShahrazadGame::decode(buf).unwrap();
        return compact.try_into();
    }
}
