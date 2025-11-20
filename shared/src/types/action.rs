use serde::{Deserialize, Serialize};
use type_reflect::*;

use crate::proto::action::shahrazad_action::Action;
use crate::proto::{self};
use crate::types::playmat::DeckTopReveal;

use super::{
    card::{ShahrazadCardId, ShahrazadCardStateTransform},
    message::Message,
    playmat::ShahrazadPlayer,
    playmat::ShahrazadPlaymatId,
    // ws::ProtoSerialize,
    zone::ShahrazadZoneId,
};

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct CardImport {
    pub str: String,
    pub amount: Option<u32>,
}

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(tag = "type")]
pub enum ShahrazadAction {
    DrawBottom {
        amount: usize,
        source: ShahrazadZoneId,
        destination: ShahrazadZoneId,
        state: ShahrazadCardStateTransform,
    },
    DrawTop {
        amount: usize,
        source: ShahrazadZoneId,
        destination: ShahrazadZoneId,
        state: ShahrazadCardStateTransform,
    },
    CardState {
        cards: Vec<ShahrazadCardId>,
        state: ShahrazadCardStateTransform,
    },
    CardZone {
        cards: Vec<ShahrazadCardId>,
        state: ShahrazadCardStateTransform,
        destination: ShahrazadZoneId,
        index: i32,
    },
    Shuffle {
        zone: ShahrazadZoneId,
        seed: String,
    },
    ZoneImport {
        zone: ShahrazadZoneId,
        cards: Vec<CardImport>,
        token: bool,
        player_id: ShahrazadPlaymatId,
        state: ShahrazadCardStateTransform,
    },
    DeckImport {
        deck_uri: String,
        player_id: ShahrazadPlaymatId,
    },
    SetPlayer {
        player_id: ShahrazadPlaymatId,
        player: Option<ShahrazadPlayer>,
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
    SetPlaymat {
        player_id: ShahrazadPlaymatId,
        reveal_deck_top: DeckTopReveal,
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
    SendMessage {
        messages: Vec<Message>,
        player_id: ShahrazadPlaymatId,
        created_at: u32,
    },
    GameTerminated,
}

impl TryFrom<proto::action::ShahrazadAction> for ShahrazadAction {
    type Error = &'static str;
    fn try_from(value: proto::action::ShahrazadAction) -> Result<Self, Self::Error> {
        let action = value.action.unwrap();
        Ok(match action {
            Action::DrawBottom(a) => {
                let amount = a.amount.try_into().map_err(|_| "[DrawBottom] amount err")?;
                let state = a
                    .state
                    .unwrap()
                    .try_into()
                    .unwrap_or(ShahrazadCardStateTransform::default());

                ShahrazadAction::DrawBottom {
                    amount,
                    source: a.source.into(),
                    destination: a.destination.into(),
                    state,
                }
            }
            Action::DrawTop(a) => {
                let amount = a.amount.try_into().map_err(|_| "[DrawTop] amount err")?;
                let state = a
                    .state
                    .unwrap()
                    .try_into()
                    .unwrap_or(ShahrazadCardStateTransform::default());
                ShahrazadAction::DrawTop {
                    amount,
                    source: a.source.into(),
                    destination: a.destination.into(),
                    state,
                }
            }
            Action::CardState(a) => ShahrazadAction::CardState {
                cards: a.cards.into_iter().map(Into::into).collect(),
                state: a
                    .state
                    .unwrap()
                    .try_into()
                    .map_err(|_| "[CardState] state err")?,
            },
            Action::CardZone(a) => ShahrazadAction::CardZone {
                cards: a.cards.into_iter().map(Into::into).collect(),
                state: a
                    .state
                    .unwrap()
                    .try_into()
                    .map_err(|_| "[CardZone] state err")?,
                destination: a.destination.into(),
                index: a.index,
            },
            Action::Shuffle(a) => ShahrazadAction::Shuffle {
                zone: a.zone.into(),
                seed: a.seed,
            },
            Action::ZoneImport(a) => ShahrazadAction::ZoneImport {
                zone: a.zone.into(),
                cards: a
                    .cards
                    .iter()
                    .map(|c| CardImport {
                        str: c.str.clone(),
                        amount: c.amount,
                    })
                    .collect(),
                token: a.token,
                player_id: a.player_id.into(),
                state: a.state.unwrap_or_default().into(),
            },
            Action::DeckImport(a) => ShahrazadAction::DeckImport {
                deck_uri: a.deck_uri,
                player_id: a.player_id.into(),
            },
            Action::SetPlayer(a) => ShahrazadAction::SetPlayer {
                player_id: a.player_id.into(),
                player: a.player.map(|p| p.into()),
            },
            Action::AddPlayer(a) => ShahrazadAction::AddPlayer {
                player_id: a.player_id.into(),
                player: a
                    .player
                    .unwrap()
                    .try_into()
                    .map_err(|_| "[AddPlayer] player err")?,
            },
            Action::SetLife(a) => ShahrazadAction::SetLife {
                player_id: a.player_id.into(),
                life: a.life,
            },
            Action::SetCommand(a) => ShahrazadAction::SetCommand {
                player_id: a.player_id.into(),
                command_id: a.command_id.into(),
                damage: a.damage,
            },
            Action::SetPlaymat(a) => ShahrazadAction::SetPlaymat {
                player_id: a.player_id.into(),
                reveal_deck_top: a.reveal_deck_top.into(),
            },
            Action::ClearBoard(a) => ShahrazadAction::ClearBoard {
                player_id: a.player_id.into(),
            },
            Action::DeleteToken(a) => ShahrazadAction::DeleteToken {
                cards: a.cards.into_iter().map(Into::into).collect(),
            },
            Action::Mulligan(a) => ShahrazadAction::Mulligan {
                player_id: a.player_id.into(),
                seed: a.seed,
            },
            Action::SendMessage(a) => ShahrazadAction::SendMessage {
                messages: a
                    .messages
                    .into_iter()
                    .map(|m| m.try_into().unwrap())
                    .collect(),
                player_id: a.player_id.into(),
                created_at: a.created_at,
            },
            Action::GameTerminated(_) => ShahrazadAction::GameTerminated,
        })
    }
}

impl From<ShahrazadAction> for proto::action::ShahrazadAction {
    fn from(value: ShahrazadAction) -> Self {
        proto::action::ShahrazadAction {
            action: match value {
                ShahrazadAction::DrawBottom {
                    amount,
                    source,
                    destination,
                    state,
                } => Some(Action::DrawBottom(proto::action::DrawBottom {
                    amount: amount.try_into().unwrap(),
                    source: source.into(),
                    destination: destination.into(),
                    state: Some(state.into()),
                })),
                ShahrazadAction::DrawTop {
                    amount,
                    source,
                    destination,
                    state,
                } => Some(Action::DrawTop(proto::action::DrawTop {
                    amount: amount.try_into().unwrap(),
                    source: source.into(),
                    destination: destination.into(),
                    state: Some(state.into()),
                })),
                ShahrazadAction::CardState { cards, state } => {
                    Some(Action::CardState(proto::action::CardState {
                        cards: cards.into_iter().map(Into::into).collect(),
                        state: Some(state.into()),
                    }))
                }
                ShahrazadAction::CardZone {
                    cards,
                    state,
                    destination,
                    index,
                } => Some(Action::CardZone(proto::action::CardZone {
                    cards: cards.into_iter().map(Into::into).collect(),
                    state: Some(state.into()),
                    destination: destination.into(),
                    index,
                })),
                ShahrazadAction::Shuffle { zone, seed } => {
                    Some(Action::Shuffle(proto::action::Shuffle {
                        zone: zone.into(),
                        seed,
                    }))
                }
                ShahrazadAction::ZoneImport {
                    zone,
                    cards,
                    token,
                    player_id,
                    state,
                } => Some(Action::ZoneImport(proto::action::ZoneImport {
                    zone: zone.into(),
                    cards: cards
                        .iter()
                        .map(|c| proto::action::CardImport {
                            str: c.str.clone(),
                            amount: c.amount,
                        })
                        .collect(),
                    token,
                    player_id: player_id.into(),
                    state: Some(state.into()),
                })),
                ShahrazadAction::DeckImport {
                    deck_uri,
                    player_id,
                } => Some(Action::DeckImport(proto::action::DeckImport {
                    deck_uri,
                    player_id: player_id.into(),
                })),
                ShahrazadAction::SetPlayer { player_id, player } => {
                    Some(Action::SetPlayer(proto::action::SetPlayer {
                        player_id: player_id.into(),
                        player: player.map(|p| p.into()),
                    }))
                }
                ShahrazadAction::AddPlayer { player_id, player } => {
                    Some(Action::AddPlayer(proto::action::AddPlayer {
                        player_id: player_id.into(),
                        player: Some(player.into()),
                    }))
                }
                ShahrazadAction::SetLife { player_id, life } => {
                    Some(Action::SetLife(proto::action::SetLife {
                        player_id: player_id.into(),
                        life,
                    }))
                }
                ShahrazadAction::SetCommand {
                    player_id,
                    command_id,
                    damage,
                } => Some(Action::SetCommand(proto::action::SetCommand {
                    player_id: player_id.into(),
                    command_id: command_id.into(),
                    damage,
                })),
                ShahrazadAction::SetPlaymat {
                    player_id,
                    reveal_deck_top,
                } => Some(Action::SetPlaymat(proto::action::SetPlaymat {
                    player_id: player_id.into(),
                    reveal_deck_top: reveal_deck_top.into(),
                })),
                ShahrazadAction::ClearBoard { player_id } => {
                    Some(Action::ClearBoard(proto::action::ClearBoard {
                        player_id: player_id.into(),
                    }))
                }
                ShahrazadAction::DeleteToken { cards } => {
                    Some(Action::DeleteToken(proto::action::DeleteToken {
                        cards: cards.into_iter().map(Into::into).collect(),
                    }))
                }
                ShahrazadAction::Mulligan { player_id, seed } => {
                    Some(Action::Mulligan(proto::action::Mulligan {
                        player_id: player_id.into(),
                        seed,
                    }))
                }
                ShahrazadAction::SendMessage {
                    messages,
                    player_id,
                    created_at,
                } => Some(Action::SendMessage(proto::action::SendMessage {
                    messages: messages.into_iter().map(|m| m.into()).collect(),
                    player_id: player_id.into(),
                    created_at: created_at,
                })),
                ShahrazadAction::GameTerminated => {
                    Some(Action::GameTerminated(proto::action::GameTerminated {}))
                }
            },
        }
    }
}
