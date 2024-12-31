// use serde::{Deserialize, Serialize};
use shared::types::{
    action,
    game::{self},
};
use wasm_bindgen::prelude::*;

// #[wasm_bindgen(typescript_custom_section)]
// const TS_APPEND_CONTENT: &'static str = r#"
// import type { ShahrazadAction, ShahrazadGame } from '../shared/bindings';

// export class GameState {
//     constructor();
//     apply_action(action: ShahrazadAction): ShahrazadGame | null;
// }
// "#;

#[wasm_bindgen]
pub struct GameState {
    inner: game::ShahrazadGame,
}

#[wasm_bindgen]
impl GameState {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            inner: game::ShahrazadGame::new(),
        }
    }

    #[wasm_bindgen]
    pub fn apply_action(&mut self, action: JsValue) -> Result<JsValue, JsValue> {
        let action: action::ShahrazadAction = serde_wasm_bindgen::from_value(action)?;

        if let Some(updated_game) = game::ShahrazadGame::apply_action(action, &mut self.inner) {
            Ok(serde_wasm_bindgen::to_value(&updated_game)?)
        } else {
            Ok(JsValue::NULL)
        }
    }

    #[wasm_bindgen]
    pub fn set_state(&mut self, game: JsValue) -> Result<JsValue, JsValue> {
        let game: game::ShahrazadGame = serde_wasm_bindgen::from_value(game)?;
        self.inner = game;

        return Ok(serde_wasm_bindgen::to_value(&self.inner)?);
    }
}
