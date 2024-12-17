use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(TS, Serialize, Deserialize)]
#[ts(export)] // This will generate TypeScript definitions for this struct
pub struct GamePiece {
    pub id: u32,
    pub x: f32,
    pub y: f32,
    pub player_id: u32,
}
