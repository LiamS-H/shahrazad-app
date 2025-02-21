use crate::tests::utils::{create_sample_card_state, create_sample_player};
use crate::types::action::ShahrazadAction;
use crate::types::card::ShahrazadCardState;
use crate::types::ws::CompactString;
#[cfg(test)]
#[test]
fn test_draw_bottom() {
    let action = ShahrazadAction::DrawBottom {
        amount: 3,
        source: "deck1".into(),
        destination: "hand1".into(),
        state: create_sample_card_state(),
    };
    let compact = action.to_compact();
    let parsed = ShahrazadAction::from_compact(&compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::DrawBottom { .. }));
}

#[test]
fn test_draw_top() {
    let action = ShahrazadAction::DrawTop {
        amount: 1,
        source: "deck1".into(),
        destination: "hand1".into(),
        state: create_sample_card_state(),
    };
    let compact = action.to_compact();
    let parsed = ShahrazadAction::from_compact(&compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::DrawTop { .. }));
}

#[test]
fn test_card_state() {
    let action = ShahrazadAction::CardState {
        cards: vec!["card1".into(), "card2".into()],
        state: create_sample_card_state(),
    };
    let compact = action.to_compact();
    let parsed = ShahrazadAction::from_compact(&compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::CardState { .. }));
}

#[test]
fn test_card_zone() {
    let action = ShahrazadAction::CardZone {
        cards: vec!["card1".into(), "card2".into()],
        state: create_sample_card_state(),
        destination: "zone1".into(),
        index: 0,
    };
    let compact = action.to_compact();
    let parsed = ShahrazadAction::from_compact(&compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::CardZone { .. }));
}

#[test]
fn test_shuffle() {
    let action = ShahrazadAction::Shuffle {
        zone: "deck1".into(),
        seed: "random_seed".to_string(),
    };
    let compact = action.to_compact();
    let parsed = ShahrazadAction::from_compact(&compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::Shuffle { .. }));
}

#[test]
fn test_zone_import() {
    let action = ShahrazadAction::ZoneImport {
        zone: "deck1".into(),
        cards: vec!["card1".to_string(), "card2".to_string()],
        token: Some(false),
        player_id: "player1".into(),
    };
    let compact = action.to_compact();
    let parsed = ShahrazadAction::from_compact(&compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::ZoneImport { .. }));
}

#[test]
fn test_deck_import() {
    let action = ShahrazadAction::DeckImport {
        deck_uri: "https://example.com/deck".to_string(),
        player_id: "player1".into(),
    };
    let compact = action.to_compact();
    let parsed = ShahrazadAction::from_compact(&compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::DeckImport { .. }));
}

#[test]
fn test_set_player() {
    let action = ShahrazadAction::SetPlayer {
        player_id: "player1".into(),
        player: create_sample_player(),
    };
    let compact = action.to_compact();
    let parsed = ShahrazadAction::from_compact(&compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::SetPlayer { .. }));
}

#[test]
fn test_add_player() {
    let action = ShahrazadAction::AddPlayer {
        player_id: "player1".into(),
        player: create_sample_player(),
    };
    let compact = action.to_compact();
    let parsed = ShahrazadAction::from_compact(&compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::AddPlayer { .. }));
}

#[test]
fn test_set_life() {
    let action = ShahrazadAction::SetLife {
        player_id: "player1".into(),
        life: 20,
    };
    let compact = action.to_compact();
    let parsed = ShahrazadAction::from_compact(&compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::SetLife { .. }));
}

#[test]
fn test_set_command() {
    let action = ShahrazadAction::SetCommand {
        player_id: "player1".into(),
        command_id: "command1".into(),
        damage: 3,
    };
    let compact = action.to_compact();
    let parsed = ShahrazadAction::from_compact(&compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::SetCommand { .. }));
}

#[test]
fn test_clear_board() {
    let action = ShahrazadAction::ClearBoard {
        player_id: "player1".into(),
    };
    let compact = action.to_compact();
    let parsed = ShahrazadAction::from_compact(&compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::ClearBoard { .. }));
}

#[test]
fn test_delete_token() {
    let action = ShahrazadAction::DeleteToken {
        cards: vec!["token1".into(), "token2".into()],
    };
    let compact = action.to_compact();
    let parsed = ShahrazadAction::from_compact(&compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::DeleteToken { .. }));
}

#[test]
fn test_mulligan() {
    let action = ShahrazadAction::Mulligan {
        player_id: "player1".into(),
        seed: "random_seed".to_string(),
    };
    let compact = action.to_compact();
    let parsed = ShahrazadAction::from_compact(&compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::Mulligan { .. }));
}

#[test]
fn test_game_terminated() {
    let action = ShahrazadAction::GameTerminated;
    let compact = action.to_compact();
    let parsed = ShahrazadAction::from_compact(&compact).unwrap();
    assert!(matches!(parsed, ShahrazadAction::GameTerminated));
}

#[test]
fn test_card_state_serialization() {
    let state = create_sample_card_state();
    let compact = state.to_compact();
    let parsed = ShahrazadCardState::from_compact(&compact).unwrap();

    assert_eq!(parsed.inverted, state.inverted);
    assert_eq!(parsed.flipped, state.flipped);
    assert_eq!(parsed.tapped, state.tapped);
    assert_eq!(parsed.face_down, state.face_down);
    assert_eq!(parsed.x, state.x);
    assert_eq!(parsed.y, state.y);

    if let (Some(parsed_revealed), Some(state_revealed)) = (&parsed.revealed, &state.revealed) {
        assert_eq!(parsed_revealed.len(), state_revealed.len());
    }

    if let (Some(parsed_counters), Some(state_counters)) = (&parsed.counters, &state.counters) {
        assert_eq!(parsed_counters.len(), state_counters.len());
    }
}

#[test]
fn test_error_handling() {
    // Test invalid format
    assert!(ShahrazadAction::from_compact("invalid").is_err());

    // Test invalid action type
    assert!(ShahrazadAction::from_compact("XX|invalid").is_err());

    // Test missing fields
    assert!(ShahrazadAction::from_compact("DB|1").is_err());

    // Test invalid card state
    assert!(ShahrazadCardState::from_compact("xInvalid_State").is_err());
}
