"use client";
import { useEffect, useState } from "react";
import init, { GameState } from "shahrazad-wasm/shahrazad_wasm";
import type { ShahrazadAction } from "@/types/bindings/action";
import type { ShahrazadGame } from "@/types/bindings/game";

export default function Test() {
    const [loaded, setLoaded] = useState(false);

    async function RunWasm() {
        await init();
        setLoaded(true);

        const game = new GameState();

        game.apply_action("AddPlayer");
        game.apply_action({});
        const result = game.apply_action({});
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
