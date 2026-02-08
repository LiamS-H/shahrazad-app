"use client";
import { wasm_isLoaded, wasm_promise } from "@/lib/client/wasm-init";
import { useState } from "react";
export function useWasmIntialized() {
    const [initialized, setInitialized] = useState(wasm_isLoaded);
    if (wasm_isLoaded) {
        return true;
    }
    wasm_promise.then(() => {
        setInitialized(true);
    });
    return initialized;
}
