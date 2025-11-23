use std::collections::VecDeque;

use prost::Message;

use crate::{
    proto::{self},
    tests::utils::create_sample_card_transform,
    types::card::ShahrazadCardState,
    types::card::ShahrazadCardStateTransform,
};
#[test]
fn test_card_state_serialization_full() {
    let state = create_sample_card_transform();
    let buf: VecDeque<u8> = proto::card::ShahrazadCardStateTransform::from(state.clone())
        .encode_to_vec()
        .into();
    let compact = proto::card::ShahrazadCardStateTransform::decode(buf).unwrap();
    let parsed = ShahrazadCardStateTransform::try_from(compact).unwrap();

    assert_eq!(parsed.inverted, state.inverted);
    assert_eq!(parsed.flipped, state.flipped);
    assert_eq!(parsed.tapped, state.tapped);
    assert_eq!(parsed.face_down, state.face_down);
    assert_eq!(parsed.x, state.x);
    assert_eq!(parsed.y, state.y);
    assert_eq!(parsed.revealed, state.revealed);
    assert_eq!(parsed.counters, state.counters);
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
    assert_eq!(parsed.revealed, state.revealed);
    assert_eq!(parsed.counters, state.counters);
}
#[test]
fn test_card_state_serialization_xy_only() {
    let state = ShahrazadCardState {
        x: Some(12),
        y: Some(12),
        ..Default::default()
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
    assert_eq!(parsed.revealed, state.revealed);
    assert_eq!(parsed.counters, state.counters);
}
#[test]
fn test_card_state_serialization_xy_max_only() {
    let state = ShahrazadCardState {
        x: Some(255 - 1),
        y: Some(255 - 1),
        ..Default::default()
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
    assert_eq!(parsed.revealed, state.revealed);
    assert_eq!(parsed.counters, state.counters);
}
