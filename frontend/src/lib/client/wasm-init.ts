import init from "shahrazad-wasm";
export let wasm_isLoaded = false;
export const wasm_promise = init().then(() => {
    wasm_isLoaded = true;
});

export function init_wasm(): Promise<void> {
    return wasm_promise;
}

// export function useWasmIntialized() {
//     const [initialized, setInitialized] = useState(wasm_isLoaded);
//     if (wasm_isLoaded) {
//         return true;
//     }
//     wasm_promise.then(() => setInitialized(true));
//     return initialized;
// }
