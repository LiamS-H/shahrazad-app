use base64::{prelude::BASE64_STANDARD, Engine};
use serde::Serialize;
use serde_wasm_bindgen::Serializer;
use shared::types::{
    action::{self},
    game::{self, ShahrazadGame},
    ws::{ClientAction, ProtoSerialize, ServerUpdate},
};
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::js_sys;

// Configure serialization options
fn to_js_value<T>(value: &T) -> Result<JsValue, JsValue>
where
    T: Serialize,
{
    let serializer = Serializer::new()
        .serialize_maps_as_objects(true)
        .serialize_large_number_types_as_bigints(true);
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
        let Ok(base64) = serde_wasm_bindgen::from_value::<String>(game) else {
            panic!("Invalid string")
        };
        let Ok(buf) = BASE64_STANDARD.decode(base64) else {
            panic!("Invalid Binary")
        };
        let Ok(game) = ShahrazadGame::decode(buf) else {
            panic!("Invalid Protobuf")
        };

        return Self { inner: game };
    }
    #[wasm_bindgen]
    pub fn get_hash(&self) -> Result<JsValue, JsValue> {
        to_js_value(&self.inner.hash())
    }
    #[wasm_bindgen]
    pub fn get_state(&self) -> Result<JsValue, JsValue> {
        to_js_value(&self.inner)
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

#[wasm_bindgen]
pub fn encode_client_action(action: JsValue) -> Result<js_sys::Uint8Array, JsValue> {
    let action: ClientAction = serde_wasm_bindgen::from_value(action)?;
    // let Ok(code) = serde_json::to_string(&action) else {
    //     return Ok(JsValue::NULL);
    // };
    let code = action.encode();

    // to_js_value(&code)
    Ok(js_sys::Uint8Array::from(&code[..]))
}

#[wasm_bindgen]
pub fn decode_server_update(code: JsValue) -> Result<JsValue, JsValue> {
    let array = js_sys::Uint8Array::new(&code);
    let code: Vec<u8> = array.to_vec();

    let Ok(update) = ServerUpdate::decode(code) else {
        return Ok(JsValue::NULL);
    };

    to_js_value(&update)
}
