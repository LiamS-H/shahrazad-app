use crate::proto::{self, message::message};
use serde::{Deserialize, Serialize};
use type_reflect::*;

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum ArrowType {
    CARD,
    ZONE,
    PLAYER,
}

impl From<i32> for ArrowType {
    fn from(value: i32) -> Self {
        match value {
            0 => ArrowType::CARD,
            1 => ArrowType::ZONE,
            2 => ArrowType::PLAYER,
            _ => ArrowType::CARD,
        }
    }
}

impl From<ArrowType> for i32 {
    fn from(value: ArrowType) -> Self {
        match value {
            ArrowType::CARD => 0,
            ArrowType::ZONE => 1,
            ArrowType::PLAYER => 2,
        }
    }
}

#[derive(Reflect, Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(tag = "type")]
pub enum Message {
    DiceRoll {
        sides: i32,
        result: i32,
    },
    Arrow {
        from: String,
        to: String,
        arrow_type: ArrowType,
    },
}

impl TryFrom<proto::message::Message> for Message {
    type Error = &'static str;

    fn try_from(value: proto::message::Message) -> Result<Self, Self::Error> {
        match value.message {
            Some(proto::message::message::Message::DiceRoll(dice_roll)) => Ok(Message::DiceRoll {
                sides: dice_roll.sides,
                result: dice_roll.result,
            }),
            Some(proto::message::message::Message::Arrow(arrow)) => Ok(Message::Arrow {
                from: arrow.from,
                to: arrow.to,
                arrow_type: arrow.arrow_type.into(),
            }),
            None => Err("Message is empty"),
        }
    }
}

impl From<Message> for proto::message::Message {
    fn from(value: Message) -> Self {
        proto::message::Message {
            message: match value {
                Message::DiceRoll { sides, result } => {
                    Some(message::Message::DiceRoll(proto::message::DiceRoll {
                        sides,
                        result,
                    }))
                }

                Message::Arrow {
                    from,
                    to,
                    arrow_type,
                } => Some(message::Message::Arrow(proto::message::Arrow {
                    from,
                    to,
                    arrow_type: arrow_type.into(),
                })),
            },
        }
    }
}
