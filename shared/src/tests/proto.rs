use std::collections::VecDeque;

use crate::tests::utils::{create_sample_card_transform, create_sample_player};
use crate::types::action::{CardImport, ShahrazadAction};
use crate::types::card::ShahrazadCardStateTransform;
use base64::Engine;
use base64::prelude::BASE64_STANDARD;
use prost::Message;

use crate::proto;
#[cfg(test)]
#[test]
fn test_draw_bottom() {
    let action = ShahrazadAction::DrawBottom {
        amount: 3,
        source: 1.into(),
        destination: 1.into(),
        state: create_sample_card_transform(),
    };
    let buf: VecDeque<u8> = proto::action::ShahrazadAction::from(action)
        .encode_to_vec()
        .try_into()
        .unwrap();
    let compact = proto::action::ShahrazadAction::decode(buf).unwrap();
    let parsed = ShahrazadAction::try_from(compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::DrawBottom { .. }));
}

#[test]
fn test_draw_top() {
    let action = ShahrazadAction::DrawTop {
        amount: 1,
        source: 1.into(),
        destination: 1.into(),
        state: create_sample_card_transform(),
    };
    let buf: VecDeque<u8> = proto::action::ShahrazadAction::from(action)
        .encode_to_vec()
        .try_into()
        .unwrap();
    let compact = proto::action::ShahrazadAction::decode(buf).unwrap();
    let parsed = ShahrazadAction::try_from(compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::DrawTop { .. }));
}

#[test]
fn test_card_state() {
    let action = ShahrazadAction::CardState {
        cards: vec![1.into(), 2.into()],
        state: create_sample_card_transform(),
    };
    let buf: VecDeque<u8> = proto::action::ShahrazadAction::from(action)
        .encode_to_vec()
        .try_into()
        .unwrap();
    let compact = proto::action::ShahrazadAction::decode(buf).unwrap();
    let parsed = ShahrazadAction::try_from(compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::CardState { .. }));
}

#[test]
fn test_card_zone() {
    let action = ShahrazadAction::CardZone {
        cards: vec![1.into(), 2.into()],
        state: create_sample_card_transform(),
        destination: 1.into(),
        index: 0,
    };
    let buf: VecDeque<u8> = proto::action::ShahrazadAction::from(action)
        .encode_to_vec()
        .try_into()
        .unwrap();
    let compact = proto::action::ShahrazadAction::decode(buf).unwrap();
    let parsed = ShahrazadAction::try_from(compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::CardZone { .. }));
}

#[test]
fn test_shuffle() {
    let action = ShahrazadAction::Shuffle {
        zone: 1.into(),
        seed: 1007 as u64,
    };
    let buf: VecDeque<u8> = proto::action::ShahrazadAction::from(action)
        .encode_to_vec()
        .try_into()
        .unwrap();
    let compact = proto::action::ShahrazadAction::decode(buf).unwrap();
    let parsed = ShahrazadAction::try_from(compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::Shuffle { .. }));
}

#[test]
fn test_zone_import() {
    let action = ShahrazadAction::ZoneImport {
        zone: 1.into(),
        cards: vec![
            CardImport {
                str: "card1".into(),
                amount: None,
            },
            CardImport {
                str: "card2".into(),
                amount: None,
            },
        ],
        token: false,
        player_id: 0.into(),
        state: ShahrazadCardStateTransform {
            ..Default::default()
        },
    };
    let buf: VecDeque<u8> = proto::action::ShahrazadAction::from(action)
        .encode_to_vec()
        .try_into()
        .unwrap();
    let compact = proto::action::ShahrazadAction::decode(buf).unwrap();
    let parsed = ShahrazadAction::try_from(compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::ZoneImport { .. }));
}

#[test]
fn test_deck_import() {
    let action = ShahrazadAction::DeckImport {
        deck_uri: "https://example.com/deck".to_string(),
        player_id: 0.into(),
    };
    let buf: VecDeque<u8> = proto::action::ShahrazadAction::from(action)
        .encode_to_vec()
        .try_into()
        .unwrap();
    let compact = proto::action::ShahrazadAction::decode(buf).unwrap();
    let parsed = ShahrazadAction::try_from(compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::DeckImport { .. }));
}

#[test]
fn test_set_player() {
    let action = ShahrazadAction::SetPlayer {
        player_id: 0.into(),
        player: Some(create_sample_player()),
    };
    let buf: VecDeque<u8> = proto::action::ShahrazadAction::from(action)
        .encode_to_vec()
        .try_into()
        .unwrap();
    let compact = proto::action::ShahrazadAction::decode(buf).unwrap();
    let parsed = ShahrazadAction::try_from(compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::SetPlayer { .. }));
}

#[test]
fn test_add_player() {
    let action = ShahrazadAction::AddPlayer {
        player_id: 0.into(),
        player: create_sample_player(),
    };
    let buf: VecDeque<u8> = proto::action::ShahrazadAction::from(action)
        .encode_to_vec()
        .try_into()
        .unwrap();
    let compact = proto::action::ShahrazadAction::decode(buf).unwrap();
    let parsed = ShahrazadAction::try_from(compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::AddPlayer { .. }));
}

#[test]
fn test_set_life() {
    let action = ShahrazadAction::SetLife {
        player_id: 0.into(),
        life: 20,
    };
    let buf: VecDeque<u8> = proto::action::ShahrazadAction::from(action)
        .encode_to_vec()
        .try_into()
        .unwrap();
    let compact = proto::action::ShahrazadAction::decode(buf).unwrap();
    let parsed = ShahrazadAction::try_from(compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::SetLife { .. }));
}

#[test]
fn test_set_command() {
    let action = ShahrazadAction::SetCommand {
        player_id: 0.into(),
        command_id: 1.into(),
        damage: 3,
    };
    let buf: VecDeque<u8> = proto::action::ShahrazadAction::from(action)
        .encode_to_vec()
        .try_into()
        .unwrap();
    let compact = proto::action::ShahrazadAction::decode(buf).unwrap();
    let parsed = ShahrazadAction::try_from(compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::SetCommand { .. }));
}

#[test]
fn test_set_playmat() {
    let action = ShahrazadAction::SetPlaymat {
        player_id: 0.into(),
        reveal_deck_top: crate::types::playmat::DeckTopReveal::NONE,
    };
    let buf: VecDeque<u8> = proto::action::ShahrazadAction::from(action)
        .encode_to_vec()
        .try_into()
        .unwrap();
    let compact = proto::action::ShahrazadAction::decode(buf).unwrap();
    let parsed = ShahrazadAction::try_from(compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::SetPlaymat { .. }));
}

#[test]
fn test_clear_board() {
    let action = ShahrazadAction::ClearBoard {
        player_id: 0.into(),
    };
    let buf: VecDeque<u8> = proto::action::ShahrazadAction::from(action)
        .encode_to_vec()
        .try_into()
        .unwrap();
    let compact = proto::action::ShahrazadAction::decode(buf).unwrap();
    let parsed = ShahrazadAction::try_from(compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::ClearBoard { .. }));
}

#[test]
fn test_delete_token() {
    let action = ShahrazadAction::DeleteToken {
        cards: vec![1.into(), 2.into()],
    };
    let buf: VecDeque<u8> = proto::action::ShahrazadAction::from(action)
        .encode_to_vec()
        .try_into()
        .unwrap();
    let compact = proto::action::ShahrazadAction::decode(buf).unwrap();
    let parsed = ShahrazadAction::try_from(compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::DeleteToken { .. }));
}

#[test]
fn test_mulligan() {
    let action = ShahrazadAction::Mulligan {
        player_id: 0.into(),
        seed: 1007 as u64,
    };
    let buf: VecDeque<u8> = proto::action::ShahrazadAction::from(action)
        .encode_to_vec()
        .try_into()
        .unwrap();
    let compact = proto::action::ShahrazadAction::decode(buf).unwrap();
    let parsed = ShahrazadAction::try_from(compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::Mulligan { .. }));
}

#[test]
fn test_game_terminated() {
    let action = ShahrazadAction::GameTerminated;
    let buf: VecDeque<u8> = proto::action::ShahrazadAction::from(action)
        .encode_to_vec()
        .try_into()
        .unwrap();
    let compact = proto::action::ShahrazadAction::decode(buf).unwrap();
    let parsed = ShahrazadAction::try_from(compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::GameTerminated));
}

#[test]
fn test_error_handling() {
    assert!(proto::action::ShahrazadAction::decode(&b"invalid"[..]).is_err());

    assert!(proto::action::ShahrazadAction::decode(&b"XX|invalid"[..]).is_err());

    assert!(proto::card::ShahrazadCardState::decode(&b"xInvalid_State"[..]).is_err());

    assert!(proto::game::ShahrazadGame::decode(&b"0"[..]).is_err());

    // for i in 0..255 {
    //     assert!(ShahrazadGame::decode([i].into()).is_err());
    // } 
}

#[test]
fn test_game() {
    use crate::proto::game::ShahrazadGame as ProtoGame;
    use crate::types::game::ShahrazadGame;
    use prost::Message;

    let mut game = crate::tests::utils::create_sample_game();
    let actions = vec![
        ShahrazadAction::AddPlayer {
            player_id: 0.into(),
            player: crate::types::playmat::ShahrazadPlayer {
                display_name: "Alice".into(),
                ..Default::default()
            },
        },
        ShahrazadAction::AddPlayer {
            player_id: 1.into(),
            player: crate::types::playmat::ShahrazadPlayer {
                display_name: "Bob".into(),
                ..Default::default()
            },
        },
        ShahrazadAction::ZoneImport {
            zone: 1.into(),
            cards: vec![
                CardImport {
                    str: "Opt".into(),
                    amount: Some(4),
                },
                CardImport {
                    str: "Island".into(),
                    amount: Some(2),
                },
            ],
            player_id: 0.into(),
            token: false,
            state: ShahrazadCardStateTransform {
                ..Default::default()
            },
        },
        ShahrazadAction::ZoneImport {
            zone: 2.into(),
            cards: vec![CardImport {
                str: "Mountain".into(),
                amount: Some(3),
            }],
            player_id: 1.into(),
            token: false,
            state: ShahrazadCardStateTransform {
                ..Default::default()
            },
        },
        ShahrazadAction::SetLife {
            player_id: 0.into(),
            life: 18,
        },
        ShahrazadAction::SetLife {
            player_id: 1.into(),
            life: 22,
        },
        ShahrazadAction::CardState {
            cards: vec![1.into()],
            state: ShahrazadCardStateTransform {
                tapped: Some(true),
                annotation: Some("test annotation!".into()),
                ..Default::default()
            },
        },
    ];

    for action in actions {
        ShahrazadGame::apply_action(action, &mut game);
    }

    let proto_game: ProtoGame = game.clone().into();
    let encoded = proto_game.encode_to_vec();
    let decoded = ProtoGame::decode(&*encoded).unwrap();
    let roundtrip: ShahrazadGame = decoded.try_into().unwrap();

    assert_eq!(game, roundtrip);

    let proto_game: ProtoGame = game.clone().into();
    let encoded = proto_game.encode_to_vec();
    let base64 = BASE64_STANDARD.encode(&encoded);
    let base64 = BASE64_STANDARD.decode(&base64).unwrap();
    let decoded = ProtoGame::decode(&*base64).unwrap();
    let roundtrip: ShahrazadGame = decoded.try_into().unwrap();
    assert_eq!(game, roundtrip);
}
