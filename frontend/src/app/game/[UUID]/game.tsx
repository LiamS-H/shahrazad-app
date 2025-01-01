"use client";
import Game from "@/components/(game)/game";
import { fetchGame } from "@/lib/fetchGame";
import { ShahrazadAction, ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadGame } from "@/types/bindings/game";
import { useState, useEffect, useRef } from "react";
import "react-scrycards/dist/index.css";
import init, { GameState } from "shahrazad-wasm";

export default function GamePage(props: { uuid: string }) {
    const game_ref = useRef<GameState>(null);
    const [isGameLoaded, setGameLoaded] = useState(false);
    const [game, setGame] = useState<ShahrazadGame | null>(null);
    const [playerUUID, setPlayerUUID] = useState<string | null>(null);

    async function loadWasm() {
        //load wasm and api request at once
        const [fetchResult, _] = await Promise.all([
            fetchGame(props.uuid),
            init(),
        ]);

        const { player_id: playerUUID, game: initialState } = fetchResult;
        setPlayerUUID(playerUUID);

        game_ref.current = new GameState(initialState);
        game_ref.current.set_state(initialState);
        setGame(initialState);

        setGameLoaded(true);
    }

    useEffect(() => {
        loadWasm();
    }, []);

    if (!game) return null;
    if (!playerUUID) return null;

    return (
        <Game
            game={game}
            player_uuid={playerUUID}
            applyAction={(a: ShahrazadAction) => {
                setGame((game) => {
                    if (!game_ref.current) {
                        console.error("attempted action with empty game ref");
                        return game;
                    }
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
