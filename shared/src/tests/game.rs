use crate::types::{action::ShahrazadAction, game::ShahrazadGame};

#[test]
fn create_game() {
    let _ = ShahrazadGame::new();
}

#[test]
fn init_game() {
    let mut game = ShahrazadGame::new();
    {
        let action = ShahrazadAction::AddPlayer;
        let mutation = ShahrazadGame::apply_action(action, &mut game).is_some();
        assert!(mutation == true);
    }
    {
        let action = ShahrazadAction::ZoneImport {
            zone: "ZONE_0".into(),
            cards: vec!["Opt".into(), "Test".into()],
        };
        let mutation = ShahrazadGame::apply_action(action, &mut game).is_some();
        assert!(mutation == true);
    }
}
