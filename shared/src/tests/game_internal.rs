// rust analyzer gets angry no matter what
#![allow(unused)]
use crate::types::card::{ShahrazadCardState, ShahrazadCardStateTransform, ShahrazadCounter};
use crate::types::game::{CardImport, ShahrazadGameSettings};
use crate::types::{action::ShahrazadAction, game::ShahrazadGame, playmat::ShahrazadPlayer};

#[test]
fn mulligan_resets_state() {
    let mut game = ShahrazadGame::new(ShahrazadGameSettings {
        commander: true,
        free_mulligans: "1".into(),
        scry_rule: true,
        starting_life: 1,
    });

    let action = ShahrazadAction::AddPlayer {
        player_id: "1".into(),
        player: ShahrazadPlayer {
            display_name: "Test".into(),
            ..Default::default()
        },
    };
    ShahrazadGame::apply_action(action, &mut game);

    let playmat = game.playmats.get(&"1".into()).unwrap();
    let command_zone_id = playmat.command.clone();
    let library_id = playmat.library.clone();
    let hand_id = playmat.hand.clone();
    let battlefield_id = playmat.battlefield.clone();

    let action = ShahrazadAction::ZoneImport {
        zone: command_zone_id.clone(),
        cards: vec![CardImport {
            str: "Commander".into(),
            amount: Some(1),
        }]
        .into(),
        player_id: "1".into(),
        token: false,
        state: Default::default(),
    };
    ShahrazadGame::apply_action(action, &mut game);

    let action = ShahrazadAction::ZoneImport {
        zone: library_id.clone(),
        cards: vec![CardImport {
            str: "Card".into(),
            amount: Some(7),
        }]
        .into(),
        player_id: "1".into(),
        token: false,
        state: Default::default(),
    };
    ShahrazadGame::apply_action(action, &mut game);

    let action = ShahrazadAction::CardZone {
        cards: vec!["C2".into(), "C3".into()].into(),
        destination: battlefield_id.clone(),
        index: 0,
        state: ShahrazadCardStateTransform {
            tapped: Some(true),
            counters: Some(vec![ShahrazadCounter { amount: 1 }].into()),
            ..Default::default()
        },
    };
    ShahrazadGame::apply_action(action, &mut game);

    let card2_before = game.cards.get(&"C2".into()).unwrap();
    assert_eq!(card2_before.location, battlefield_id);
    assert_eq!(card2_before.state.tapped, true);
    assert!(card2_before.state.counters[0] == ShahrazadCounter { amount: 1 });

    let card3_before = game.cards.get(&"C3".into()).unwrap();
    assert_eq!(card3_before.location, battlefield_id);

    let action = ShahrazadAction::Mulligan {
        player_id: "1".into(),
        seed: "test".into(),
    };
    ShahrazadGame::apply_action(action, &mut game);

    let playmat_after = game.playmats.get(&"1".into()).unwrap();
    assert_eq!(playmat_after.mulligans, 0);

    let card1_after = game.cards.get(&"C1".into()).unwrap();
    assert_eq!(card1_after.location, command_zone_id); // Commander stays

    let expected_state = ShahrazadCardState {
        flipped: false,
        inverted: false,
        tapped: false,
        face_down: true,
        counters: [].into(),
        revealed: ["1".into()].into(),
        x: None,
        y: None,
        annotation: "".into(),
    };
    let card2_after = game.cards.get(&"C2".into()).unwrap();
    assert_eq!(card2_after.location, hand_id);
    assert_eq!(card2_after.state, expected_state);

    let card3_after = game.cards.get(&"C3".into()).unwrap();
    assert_eq!(card3_after.location, hand_id);
    assert_eq!(card3_after.state, expected_state);

    for i in 4..=8 {
        let card_id = format!("C{}", i);
        let card = game.cards.get(&card_id.into()).unwrap();
        assert_eq!(card.location, hand_id);
    }
}
