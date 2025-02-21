use crate::types::{
    card::{ShahrazadCardState, ShahrazadCounter},
    game::{ShahrazadGame, ShahrazadGameSettings},
    player::ShahrazadPlayer,
};

pub fn create_sample_card_state() -> ShahrazadCardState {
    ShahrazadCardState {
        inverted: Some(true),
        flipped: Some(false),
        tapped: Some(true),
        face_down: Some(false),
        revealed: Some(vec!["player1".into(), "player2".into()]),
        x: Some(1),
        y: Some(2),
        counters: Some(vec![ShahrazadCounter { amount: 3 }]),
    }
}

pub fn create_sample_player() -> ShahrazadPlayer {
    ShahrazadPlayer {
        display_name: "TestPlayer|;".to_string(),
    }
}

pub fn create_sample_game() -> ShahrazadGame {
    ShahrazadGame::new(DEFAULT_GAME_SETTINGS)
}

pub const DEFAULT_GAME_SETTINGS: ShahrazadGameSettings = ShahrazadGameSettings {
    starting_life: 20,
    free_mulligans: String::new(),
    commander: true,
    scry_rule: true,
};
