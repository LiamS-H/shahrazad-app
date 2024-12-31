use crate::types::{action::ShahrazadAction, game::ShahrazadGame};
use pretty_assertions::assert_eq;
use serde_json::Value;
use type_reflect::serde_json;

#[test]
fn create_game() {
    let _ = ShahrazadGame::new();
}

#[test]
fn add_player() {
    let mut game = ShahrazadGame::new();
    {
        let action = ShahrazadAction::AddPlayer { uuid: "1".into() };
        let mutation = ShahrazadGame::apply_action(action, &mut game).is_some();
        assert!(mutation == true);
    }
}
#[test]
fn init_game() {
    let mut game = ShahrazadGame::new();
    {
        let action = ShahrazadAction::AddPlayer { uuid: "1".into() };
        let mutation = ShahrazadGame::apply_action(action, &mut game);
        assert!(mutation.is_some());
        let Some(new_state) = mutation else { panic!() };

        let expected_string = r#"{
            "zone_count": 6,
            "card_count": 0,
            "cards": {},
            "zones": {"ZONE_1":{"cards":[]},"ZONE_2":{"cards":[]},"ZONE_3":{"cards":[]},"ZONE_4":{"cards":[]},"ZONE_5":{"cards":[]},"ZONE_6":{"cards":[]}},
            "playmats": {"1":{"library":"ZONE_1","hand":"ZONE_2","graveyard":"ZONE_3","battlefield":"ZONE_4","exile":"ZONE_5","command":"ZONE_6"}},
            "players": ["1"]
        }"#;
        let expected_json_value: Value = serde_json::from_str(expected_string).unwrap();
        let actual_json_value: Value = serde_json::to_value(new_state).unwrap();
        assert_eq!(expected_json_value, actual_json_value);
    }
    {
        let action = ShahrazadAction::ZoneImport {
            zone: "ZONE_1".into(),
            cards: ["Opt".into()].into(),
        };
        let mutation = ShahrazadGame::apply_action(action, &mut game);
        assert!(mutation.is_some());
        let Some(new_state) = mutation else { panic!() };

        let expected_string = r#"{
            "zone_count": 6,
            "card_count": 1,
            "cards": {"CARD_1":{"state":{"inverted": false, "flipped": false, "tapped": false, "face_down": true, "x": null, "y": null}, "card_name": "Opt", "location":"ZONE_1"}},
            "zones": {"ZONE_1":{"cards":["CARD_1"]},"ZONE_2":{"cards":[]},"ZONE_3":{"cards":[]},"ZONE_4":{"cards":[]},"ZONE_5":{"cards":[]},"ZONE_6":{"cards":[]}},
            "playmats": {"1":{"library":"ZONE_1","hand":"ZONE_2","graveyard":"ZONE_3","battlefield":"ZONE_4","exile":"ZONE_5","command":"ZONE_6"}},
            "players": ["1"]
        }"#;
        let expected_json_value: Value = serde_json::from_str(expected_string).unwrap();
        let actual_json_value: Value = serde_json::to_value(new_state).unwrap();
        assert_eq!(expected_json_value, actual_json_value);
    }
}
