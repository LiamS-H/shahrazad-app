use uuid::Uuid;

#[cfg(test)]
use crate::types::action::ShahrazadAction;
use crate::{
    tests::utils::create_sample_game,
    types::ws::{ClientAction, CompactString, ServerUpdate},
};

use super::utils::create_sample_card_state;

fn create_sample_action() -> ShahrazadAction {
    ShahrazadAction::DrawTop {
        amount: 1,
        source: "deck1".into(),
        destination: "hand1".into(),
        state: create_sample_card_state(),
    }
}

#[test]
fn test_client_action_compact_with_action() {
    let action = create_sample_action();
    let hash = create_sample_game().hash().to_string();
    let client_action = ClientAction {
        action: Some(action.clone()),
        hash: Some(hash.to_string()),
    };

    let compact = client_action.to_compact();
    let parsed = ClientAction::from_compact(&compact).unwrap();

    assert_eq!(parsed.action, Some(action));
    assert_eq!(parsed.hash, Some(hash.to_string()));
}

#[test]
fn test_client_action_compact_empty() {
    let client_action = ClientAction {
        action: None,
        hash: None,
    };

    let compact = client_action.to_compact();
    let parsed = ClientAction::from_compact(&compact).unwrap();

    assert!(parsed.action.is_none());
    assert!(parsed.hash.is_none());
}

#[test]
fn test_server_update_compact_full() {
    let action = create_sample_action();
    let game = create_sample_game();
    let player_id = Uuid::new_v4();
    let hash = game.hash().to_string();

    let server_update = ServerUpdate {
        action: Some(action.clone()),
        game: Some(game.clone()),
        player_id,
        hash: Some(hash.clone()),
    };

    let compact = server_update.to_compact();
    let parsed = ServerUpdate::from_compact(&compact).unwrap();

    assert_eq!(parsed.action, Some(action));
    assert_eq!(parsed.game, Some(game));
    assert_eq!(parsed.player_id, player_id);
    assert_eq!(parsed.hash, Some(hash));
}

#[test]
fn test_server_update_compact_partial() {
    let player_id = Uuid::new_v4();

    let server_update = ServerUpdate {
        action: None,
        game: None,
        player_id,
        hash: None,
    };

    let compact = server_update.to_compact();
    let parsed = ServerUpdate::from_compact(&compact).unwrap();

    assert!(parsed.action.is_none());
    assert!(parsed.game.is_none());
    assert_eq!(parsed.player_id, player_id);
    assert!(parsed.hash.is_none());
}

#[test]
fn test_invalid_compact_strings() {
    assert!(ClientAction::from_compact("invalid_format").is_err());

    assert!(ServerUpdate::from_compact("invalid_format").is_err());
}
