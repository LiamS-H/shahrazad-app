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
    const socket_ref = useRef<WebSocket>(null);
    const init_ref = useRef<boolean>(false);
    const [game, setGame] = useState<ShahrazadGame | null>(null);
    const [playerUUID, setPlayerUUID] = useState<string | null>(null);

    function cleanup() {
        if (game_ref.current) {
            game_ref.current.free();
        }
        if (socket_ref.current) {
            //gracefull shutdown code
            socket_ref.current.close(1000);
        }
    }

    async function initGame() {
        if (init_ref.current) return;
        init_ref.current = true;

        const stored_player = localStorage.getItem("saved-player") || undefined;
        //load wasm and api request at once
        const [fetchResult, _] = await Promise.all([
            fetchGame(props.uuid, stored_player),
            init(),
        ]);

        const { player_id: playerUUID, game: initialState } = fetchResult;
        setPlayerUUID(playerUUID);
        localStorage.setItem("saved-player", playerUUID);

        game_ref.current = new GameState(initialState);
        setGame(initialState);

        socket_ref.current = new WebSocket(
            `/api/ws/game/${props.uuid}/player/${playerUUID}`
        );
        socket_ref.current.onopen = (event) => {
            console.log("[ws] connected.");
        };

        socket_ref.current.onmessage = (event) => {
            if (!game_ref.current) {
                console.error("[ws] recieved connection before wasm loaded.");
                return;
            }
            try {
                const {
                    action,
                    game,
                }: { action?: ShahrazadAction; game?: ShahrazadGame } =
                    JSON.parse(event.data);

                let new_game: null | ShahrazadGame = null;
                if (action) {
                    new_game = game_ref.current.apply_action(action);
                    console.log("[ws] recieved action:", action);
                } else if (game) {
                    new_game = game_ref.current.set_state(game);
                    console.log("[ws] recieved game:", game);
                }
                setGame((game) => new_game || game);
            } catch (error) {
                console.error("[ws] trouble applying recieved data:\n", error);
            }
        };
        socket_ref.current.onerror = (error) => {
            console.error("[ws] connection error:\n", error);
            socket_ref.current?.close();
        };

        return;
    }

    function broadCastAction(action: ShahrazadAction) {
        console.log("broadcasting action", action);
        if (!socket_ref.current) {
            console.error("broadcasted before sockect connected.");
            return;
        }
        if (socket_ref.current.readyState !== WebSocket.OPEN) {
            console.error(
                "broadcasted before socket is ready. state:",
                socket_ref.current.readyState
            );
            return;
        }
        socket_ref.current.send(JSON.stringify(action));
    }

    useEffect(() => {
        initGame();
        return cleanup;
    }, []);

    if (!game) return null;
    if (!playerUUID) return null;

    return (
        <Game
            game={game}
            player_uuid={playerUUID}
            applyAction={(a: ShahrazadAction) => {
                console.log("applying action:", a);
                const new_game: ShahrazadGame | null =
                    game_ref.current?.apply_action(a) || null;
                if (!new_game) {
                    console.log("game state same");
                    return;
                }
                console.log("resulting game:", new_game);
                setGame(new_game);
                broadCastAction(a);
            }}
        />
    );
}
