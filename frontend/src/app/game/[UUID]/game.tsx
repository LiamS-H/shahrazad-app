"use client";
import Game from "@/components/(game)/game";
import { fetchGame } from "@/lib/fetchGame";
import { ShahrazadAction, ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadGame } from "@/types/bindings/game";
import { ClientAction, ServerUpdate } from "@/types/bindings/ws";
import { useState, useEffect, useRef, useCallback } from "react";
import { useScrycardsContext } from "react-scrycards";
import "react-scrycards/dist/index.css";
import init, { GameState } from "shahrazad-wasm";

export default function GamePage(props: { game_id: string }) {
    const game_ref = useRef<GameState>(null);
    const socket_ref = useRef<WebSocket>(null);
    const init_ref = useRef<boolean>(false);
    const move_count_ref = useRef<number>(0);
    const [game, setGame] = useState<ShahrazadGame | null>(null);
    const [playerUUID, setPlayerUUID] = useState<string | null>(null);
    const { preloadCards } = useScrycardsContext();

    function cleanup() {
        if (game_ref.current) {
            game_ref.current.free();
        }
        if (socket_ref.current) {
            //graceful shutdown status code
            socket_ref.current.close(1000);
        }
    }

    function apply_action(action: ShahrazadAction): void {
        if (!game_ref.current) {
            console.error("[client] tried to take action before game loaded.");
            return;
        }
        const new_name = game_ref.current.apply_action(action);
        if (action.type == ShahrazadActionCase.ZoneImport) {
            preloadCards(action.cards);
        }
        setGame((game) => new_name || game);
    }

    function set_game(game: ShahrazadGame): void {
        if (!game_ref.current) {
            console.error("[client] tried to take action before game loaded.");
            return;
        }
        const new_name = game_ref.current.set_state(game);
        setGame((game) => new_name || game);
    }

    const initGame = useCallback(
        async function () {
            if (init_ref.current) return;
            init_ref.current = true;

            const stored_player =
                localStorage.getItem("saved-player") || undefined;
            //load wasm and api request at once
            const [fetchResult] = await Promise.all([
                fetchGame(props.game_id, stored_player),
                init(),
            ]);

            const { player_id: playerUUID, game: initialState } = fetchResult;
            setPlayerUUID(playerUUID);
            localStorage.setItem("saved-player", playerUUID);

            game_ref.current = new GameState(initialState);
            setGame(initialState);

            socket_ref.current = new WebSocket(
                `/api/ws/game/${props.game_id}/player/${playerUUID}`
            );
            socket_ref.current.onopen = (event) => {
                console.log("[ws] connected.", event);
            };

            socket_ref.current.onmessage = (event) => {
                if (!game_ref.current) {
                    console.error(
                        "[ws] received connection before wasm loaded."
                    );
                    return;
                }
                try {
                    const { action, game, sequence_number }: ServerUpdate =
                        JSON.parse(event.data);
                    move_count_ref.current = sequence_number;

                    if (action) {
                        apply_action(action);
                        console.log("[ws] received action:", action);
                    } else if (game) {
                        set_game(game);
                        console.log("[ws] received game:", game);
                    }
                } catch (error) {
                    console.error(
                        "[ws] trouble applying received data:\n",
                        error
                    );
                }
            };
            socket_ref.current.onerror = (error) => {
                console.error("[ws] connection error:\n", error);
                socket_ref.current?.close();
            };

            return;
        },
        [props.game_id]
    );

    function broadCastAction(action: ShahrazadAction) {
        if (!socket_ref.current) {
            console.error("broadcasted before socket connected.");
            return;
        }
        if (socket_ref.current.readyState !== WebSocket.OPEN) {
            console.error(
                "broadcasted before socket is ready. state:",
                socket_ref.current.readyState
            );
            return;
        }
        move_count_ref.current += 1;
        const req: ClientAction = {
            action,
            sequence_number: move_count_ref.current,
        };
        console.log("[ws] broadcasting action", req);

        socket_ref.current.send(JSON.stringify(req));
    }

    useEffect(() => {
        initGame();
        return cleanup;
    }, [initGame]);

    if (!game) return null;
    if (!playerUUID) return null;

    return (
        <Game
            game={game}
            player_uuid={playerUUID}
            applyAction={(a: ShahrazadAction) => {
                apply_action(a);

                // console.log("applying action:", a);
                // const new_game: ShahrazadGame | null =
                //     game_ref.current?.apply_action(a) || null;
                // if (!new_game) {
                //     console.log("game state same");
                //     return;
                // }
                // console.log("resulting game:", new_game);
                // setGame(new_game);
                broadCastAction(a);
            }}
        />
    );
}
