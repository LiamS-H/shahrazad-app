"use client";
import Game from "@/components/(game)/game";
import { ShahrazadAction, ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadGame } from "@/types/bindings/game";
import { useState, useEffect, useRef } from "react";
// import { useEffect } from "react";
import "react-scrycards/dist/index.css";
import init, { GameState } from "shahrazad-wasm";

export default function GamePage() {
    const game_ref = useRef<GameState>(null);
    const [wasmLoaded, setWasmLoaded] = useState(false);
    const [game, setGame] = useState<ShahrazadGame>({
        zone_count: 0,
        card_count: 0,
        cards: {},
        playmats: {},
        zones: {},
        players: [],
    });

    async function loadWasm() {
        await init();
        game_ref.current = new GameState();
        setWasmLoaded(true);
    }

    useEffect(() => {
        loadWasm();
    }, []);

    useEffect(() => {
        if (game_ref.current == null) return;
        if (!wasmLoaded) return;

        // const newGame: ShahrazadGame = {
        //     zone_count: 0,
        //     card_count: 0,
        //     cards: {},
        //     playmats: [],
        //     zones: {},
        // };
        // game_ref.current.set_state(newGame);

        let newGame: ShahrazadGame = game_ref.current.apply_action({
            type: ShahrazadActionCase.AddPlayer,
            uuid: "1",
        });
        console.log(newGame);
        newGame = game_ref.current.apply_action({
            type: ShahrazadActionCase.AddPlayer,
            uuid: "2",
        });
        console.log(newGame);
        newGame = game_ref.current.apply_action({
            type: ShahrazadActionCase.ZoneImport,
            cards: [
                "Akki Lavarunner // Tok-Tok, Volcano Born",
                "Opt",
                "Mental Misstep",
            ],
            zone: newGame.playmats["1"].library,
        });
        console.log(newGame);
        const game = game_ref.current.apply_action({
            type: ShahrazadActionCase.ZoneImport,
            cards: ["Akki Lavarunner // Tok-Tok, Volcano Born"],
            zone: newGame.playmats["2"].library,
        });
        console.log(game);
        setGame(game);
    }, [wasmLoaded]);

    return (
        <Game
            game={game}
            applyMove={(a: ShahrazadAction) => {
                setGame((game) => {
                    if (!game_ref.current) return game;
                    if (!wasmLoaded) return game;
                    const new_game = game_ref.current.apply_action(a);
                    if (!new_game) {
                        console.log("game state same");
                        return game;
                    }
                    console.log("resulting game:", new_game);
                    return new_game;
                });
            }}
        />
    );
}
