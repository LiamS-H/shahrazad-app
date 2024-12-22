"use client";
import { useEffect, useState } from "react";
import init, { GameState } from "./pkg/shahrazad.js";
import type { ShahrazadAction } from "@/types/bindings/ShahrazadAction";
import type { ShahrazadGame } from "@/types/bindings/ShahrazadGame";

export default function Test() {
    const [loaded, setLoaded] = useState(false);

    async function RunWasm() {
        // Initialize WASM
        await init();
        setLoaded(true);

        // Create a new game instance
        const game = new GameState();

        // Example action
        const action: ShahrazadAction = "AddPlayer";

        // Apply the action
        game.apply_action("AddPlayer");
        const result = game.apply_action({
            ZoneImport: {
                cards: ["Opt"],
                zone: "ZONE_1",
            },
        });
        console.log(result);
    }

    useEffect(() => {
        RunWasm();
    }, []);

    if (!loaded) {
        return "loading wasm";
    }

    return "wasm loaded";
}
