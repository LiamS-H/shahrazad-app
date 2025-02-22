use std::collections::VecDeque;

use prost::Message;

use crate::{proto, tests::utils::create_sample_card_state, types::card::ShahrazadCardState};
#[test]
fn test_card_state_serialization_full() {
    let state = create_sample_card_state();
    let buf: VecDeque<u8> = proto::card::ShahrazadCardState::from(state.clone())
        .encode_to_vec()
        .into();
    let compact = proto::card::ShahrazadCardState::decode(buf).unwrap();
    let parsed = ShahrazadCardState::try_from(compact).unwrap();

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
fn test_card_state_serialization_empty() {
    let state = ShahrazadCardState::default();
    let buf: VecDeque<u8> = proto::card::ShahrazadCardState::from(state.clone())
        .encode_to_vec()
        .into();
    let compact = proto::card::ShahrazadCardState::decode(buf).unwrap();
    let parsed = ShahrazadCardState::try_from(compact).unwrap();

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
fn test_card_state_serialization_xy_only() {
    let state = ShahrazadCardState {
        inverted: None,
        flipped: None,
        tapped: None,
        face_down: None,
        revealed: None,
        x: Some(12),
        y: Some(12),
        counters: None,
    };
    let buf: VecDeque<u8> = proto::card::ShahrazadCardState::from(state.clone())
        .encode_to_vec()
        .into();
    println!("{}", buf.len());
    let compact = proto::card::ShahrazadCardState::decode(buf).unwrap();
    let parsed = ShahrazadCardState::try_from(compact).unwrap();

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
