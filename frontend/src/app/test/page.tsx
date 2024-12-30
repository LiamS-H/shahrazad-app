"use client";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { useEffect, useState } from "react";
import init, { GameState } from "shahrazad-wasm";

export default function Test() {
    const [loaded, setLoaded] = useState(false);

    async function RunWasm() {
        await init();
        setLoaded(true);

        const game = new GameState();

        const result = game.apply_action({
            type: ShahrazadActionCase.AddPlayer,
        });

        // game.apply_action({});
        // const result = game.apply_action({});
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
