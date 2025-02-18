use serde::Serialize;
use serde_wasm_bindgen::Serializer;
use shared::types::{
    action,
    game::{self, ShahrazadGame},
};
use wasm_bindgen::prelude::*;

// Configure serialization options
fn to_js_value<T>(value: &T) -> Result<JsValue, JsValue>
where
    T: Serialize,
{
    let serializer = Serializer::new().serialize_maps_as_objects(true);
    value.serialize(&serializer).map_err(|e| e.into())
}

#[wasm_bindgen]
pub struct GameState {
    inner: game::ShahrazadGame,
}

#[wasm_bindgen]
impl GameState {
    #[wasm_bindgen(constructor)]
    pub fn new(game: JsValue) -> Self {
        if let Ok(game) = serde_wasm_bindgen::from_value::<ShahrazadGame>(game) {
            Self { inner: game }
        } else {
            panic!("Error loading game")
        }
    }
    #[wasm_bindgen]
    pub fn get_hash(&self) -> Result<JsValue, JsValue> {
        to_js_value(&self.inner.hash().to_string())
    }

    #[wasm_bindgen]
    pub fn apply_action(&mut self, action: JsValue) -> Result<JsValue, JsValue> {
        let action: action::ShahrazadAction = serde_wasm_bindgen::from_value(action)?;

        if let Some(updated_game) = game::ShahrazadGame::apply_action(action, &mut self.inner) {
            to_js_value(&updated_game)
        } else {
            Ok(JsValue::NULL)
        }
    }

    #[wasm_bindgen]
    pub fn set_state(&mut self, game: JsValue) -> Result<JsValue, JsValue> {
        let game: game::ShahrazadGame = serde_wasm_bindgen::from_value(game)?;
        self.inner = game;

        to_js_value(&self.inner)
    }
}
