import init from "shahrazad-wasm";
export let wasm_isLoaded = false;

export let wasm_promise = new Promise<void>(() => {});
if (typeof window !== "undefined") {
    wasm_promise = init().then(() => {
        wasm_isLoaded = true;
    });
}

export function init_wasm(): Promise<void> {
    return wasm_promise;
}
