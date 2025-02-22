use prost::Message;
use serde::{Deserialize, Serialize};
use type_reflect::*;

use std::collections::VecDeque;
use uuid::Uuid;

use crate::proto;

use super::{action::ShahrazadAction, game::ShahrazadGame};

#[derive(Reflect, Clone, Serialize, Deserialize)]
pub struct ClientAction {
    pub action: Option<ShahrazadAction>,
    pub hash: Option<String>,
}

#[derive(Reflect, Clone, Serialize, Deserialize)]
pub struct ServerUpdate {
    pub action: Option<ShahrazadAction>,
    pub game: Option<ShahrazadGame>,
    pub player_id: Uuid,
    pub hash: Option<String>,
}

impl From<proto::ws::ClientAction> for ClientAction {
    fn from(value: proto::ws::ClientAction) -> Self {
        ClientAction {
            action: value.action.and_then(|action| action.try_into().ok()),
            hash: if value.hash == "" {
                None
            } else {
                Some(value.hash)
            },
        }
    }
}

impl From<ClientAction> for proto::ws::ClientAction {
    fn from(value: ClientAction) -> Self {
        proto::ws::ClientAction {
            action: value.action.and_then(|a| Some(a.into())),
            hash: match value.hash {
                Some(h) => h,
                None => "".into(),
            },
        }
    }
}

impl ProtoSerialize for ClientAction {
    fn encode(&self) -> Vec<u8> {
        let prot: proto::ws::ClientAction = self.clone().into();
        prot.encode_to_vec()
    }

    fn decode(s: Vec<u8>) -> Result<Self, &'static str> {
        let buf: VecDeque<u8> = s.into();
        let Ok(prot) = proto::ws::ClientAction::decode(buf) else {
            return Err("couldn't decode");
        };
        Ok(ClientAction::from(prot))
    }
}

impl TryFrom<proto::ws::ServerUpdate> for ServerUpdate {
    type Error = &'static str;

    fn try_from(value: proto::ws::ServerUpdate) -> Result<Self, Self::Error> {
        let Ok(player_id) = Uuid::parse_str(&value.player_id) else {
            panic!();
        };

        Ok(ServerUpdate {
            action: value.action.and_then(|action| action.try_into().ok()),
            hash: if value.hash == "" {
                None
            } else {
                Some(value.hash)
            },
            game: value.game.and_then(|game| game.try_into().ok()),
            player_id,
        })
    }
}

impl From<ServerUpdate> for proto::ws::ServerUpdate {
    fn from(value: ServerUpdate) -> Self {
        proto::ws::ServerUpdate {
            action: value.action.and_then(|a| Some(a.into())),
            game: value.game.and_then(|g| Some(g.into())),
            player_id: value.player_id.into(),
            hash: match value.hash {
                Some(hash) => hash,
                None => "".into(),
            },
        }
    }
}

impl ProtoSerialize for ServerUpdate {
    fn encode(&self) -> Vec<u8> {
        let prot: proto::ws::ServerUpdate = self.clone().into();
        prot.encode_to_vec()
    }

    fn decode(s: Vec<u8>) -> Result<Self, &'static str> {
        let buf: VecDeque<u8> = s.into();
        let Ok(prot) = proto::ws::ServerUpdate::decode(buf) else {
            return Err("couldn't decode");
        };
        ServerUpdate::try_from(prot)
    }
}

pub trait ProtoSerialize {
    fn encode(&self) -> Vec<u8>;
    fn decode(s: Vec<u8>) -> Result<Self, &'static str>
    where
        Self: Sized;
}
