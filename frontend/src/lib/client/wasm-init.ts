import init from "shahrazad-wasm";
const initialized = init();

export function init_wasm(): Promise<undefined> {
    return initialized;
}
