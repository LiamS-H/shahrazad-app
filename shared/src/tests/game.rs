use crate::types::{
    action::ShahrazadAction,
    card::{ShahrazadCardState, ShahrazadCounter},
    game::ShahrazadGame,
    player::ShahrazadPlayer,
};
use pretty_assertions::assert_eq;
use serde_json::Value;
use type_reflect::serde_json;

use super::utils::create_sample_game;

#[test]
fn create_game() {
    let _ = create_sample_game();
}

#[test]
fn add_player() {
    let mut game = create_sample_game();
    {
        let action = ShahrazadAction::AddPlayer {
            player_id: "1".into(),
            player: ShahrazadPlayer {
                display_name: "Test".into(),
            },
        };
        let mutation = ShahrazadGame::apply_action(action, &mut game).is_some();
        assert!(mutation == true);
    }
}
#[test]
fn init_game() {
    let mut game = create_sample_game();
    {
        let action = ShahrazadAction::AddPlayer {
            player_id: "1".into(),
            player: ShahrazadPlayer {
                display_name: "Test".into(),
            },
        };
        let mutation = ShahrazadGame::apply_action(action, &mut game);
        assert!(mutation.is_some());
        let Some(new_state) = mutation else { panic!() };

        let expected_string = r#"{
            "zone_count": 6,
            "card_count": 0,
            "cards": {},
            "zones": {"ZONE_1":{"cards":[]},"ZONE_2":{"cards":[]},"ZONE_3":{"cards":[]},"ZONE_4":{"cards":[]},"ZONE_5":{"cards":[]},"ZONE_6":{"cards":[]}},
            "playmats": {
                "1":{
                    "library":"ZONE_1",
                    "hand":"ZONE_2",
                    "graveyard":"ZONE_3",
                    "battlefield":"ZONE_4",
                    "exile":"ZONE_5",
                    "command":"ZONE_6",
                    "command_damage":{"1":0},
                    "life": 20,
                    "mulligans": 0,
                    "player": {
                        "display_name": "Test"
                    }
                }
            },
            "players": ["1"],
            "settings": {
                "free_mulligans": "",
                "scry_rule": true,
                "starting_life": 20,
                "commander": true
            }
        }"#;
        let expected_json_value: Value = serde_json::from_str(expected_string).unwrap();
        let actual_json_value: Value = serde_json::to_value(new_state).unwrap();
        assert_eq!(expected_json_value, actual_json_value);
    }
    {
        let action = ShahrazadAction::ZoneImport {
            zone: "ZONE_1".into(),
            cards: ["Opt".into()].into(),
            player_id: "1".into(),
            token: false,
        };
        let mutation = ShahrazadGame::apply_action(action, &mut game);
        assert!(mutation.is_some());
        let Some(new_state) = mutation else { panic!() };

        let expected_string = r#"{
            "zone_count": 6,
            "card_count": 1,
            "cards": {
                "CARD_1":{
                    "state":{
                        "inverted": null,
                        "flipped": null,
                        "tapped": null,
                        "face_down": null,
                        "revealed": null,
                        "x": null,
                        "y": null,
                        "counters" : []
                    },
                    "owner":"1",
                    "token": false,
                    "card_name": "Opt",
                    "location":"ZONE_1"
                }
            },
            "zones": {"ZONE_1":{"cards":["CARD_1"]},"ZONE_2":{"cards":[]},"ZONE_3":{"cards":[]},"ZONE_4":{"cards":[]},"ZONE_5":{"cards":[]},"ZONE_6":{"cards":[]}},
            "playmats": {
                "1":{
                    "library":"ZONE_1",
                    "hand":"ZONE_2",
                    "graveyard":"ZONE_3",
                    "battlefield":"ZONE_4",
                    "exile":"ZONE_5",
                    "command":"ZONE_6",
                    "command_damage":{"1":0},
                    "life": 20,
                    "mulligans": 0,
                    "player": {
                        "display_name": "Test"
                    }
                }
            },
            "players": ["1"],
            "settings": {
                "free_mulligans": "",
                "scry_rule": true,
                "starting_life": 20,
                "commander": true
            }
        }"#;
        let expected_json_value: Value = serde_json::from_str(expected_string).unwrap();
        let actual_json_value: Value = serde_json::to_value(new_state).unwrap();
        assert_eq!(expected_json_value, actual_json_value);
    }
}

#[test]
fn reproducibility() {
    let mut game1 = create_sample_game();
    let mut game2 = create_sample_game();

    let actions: Vec<ShahrazadAction> = [
        ShahrazadAction::AddPlayer {
            player_id: "1".into(),
            player: ShahrazadPlayer {
                display_name: "Test".into(),
            },
        },
        ShahrazadAction::ZoneImport {
            zone: "ZONE_1".into(),
            cards: [
                "Opt".into(),
                "Opt".into(),
                "Opt".into(),
                "Opt".into(),
                "Opt".into(),
                "Opt".into(),
            ]
            .into(),
            player_id: "1".into(),
            token: false,
        },
        ShahrazadAction::SetPlayer {
            player_id: "1".into(),
            player: ShahrazadPlayer {
                display_name: "test".into(),
            },
        },
        ShahrazadAction::CardZone {
            cards: [
                "CARD_1".into(),
                "CARD_2".into(),
                "CARD_3".into(),
                "CARD_4".into(),
                "CARD_5".into(),
                "CARD_6".into(),
            ]
            .into(),
            state: ShahrazadCardState {
                inverted: Some(true),
                flipped: Some(true),
                tapped: Some(true),
                face_down: Some(true),
                revealed: Some(["1".into()].into()),
                x: Some(0),
                y: Some(0),
                counters: Some([ShahrazadCounter { amount: 1 }].into()),
            },
            destination: "ZONE_2".into(),
            index: 0,
        },
        ShahrazadAction::CardState {
            cards: ["CARD_1".into()].into(),
            state: ShahrazadCardState {
                inverted: Some(false),
                flipped: Some(false),
                tapped: Some(false),
                face_down: Some(false),
                revealed: Some([].into()),
                x: Some(1),
                y: Some(1),
                counters: Some([ShahrazadCounter { amount: 2 }].into()),
            },
        },
    ]
    .into();

    for action in &actions {
        ShahrazadGame::apply_action(action.clone(), &mut game1);
        assert!(game1.hash() != game2.hash());
        ShahrazadGame::apply_action(action.clone(), &mut game2);
        assert!(game1.hash() == game2.hash());
    }
}
