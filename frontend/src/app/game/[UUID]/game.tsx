"use client";
import Game from "@/components/(game)/game";
import { fetchGame } from "@/lib/fetchGame";
import { ShahrazadAction } from "@/types/bindings/action";
import { ShahrazadGame } from "@/types/bindings/game";
import { useState, useEffect, useRef } from "react";
import { useScrycardsContext } from "react-scrycards";
import "react-scrycards/dist/index.css";
import init from "shahrazad-wasm";
import { GameClient } from "@/lib/client";
import { useRouter } from "next/router";
import GameError from "./error";

export default function GamePage(props: { game_id: string }) {
    const [game, setGame] = useState<ShahrazadGame | null | undefined>(null);
    const [playerUUID, setPlayerUUID] = useState<string | null>(null);
    const { preloadCards } = useScrycardsContext();
    const gameClientRef = useRef<GameClient | null>(null);

    useEffect(() => {
        let mounted = true;

        const initGame = async () => {
            const stored_player =
                localStorage.getItem("saved-player") || undefined;

            try {
                const [fetchResult] = await Promise.all([
                    fetchGame(props.game_id, stored_player),
                    init(),
                ]);

                if (!mounted) return;

                const { player_id: playerUUID, game: initialState } =
                    fetchResult;
                setPlayerUUID(playerUUID);
                localStorage.setItem("saved-player", playerUUID);

                const gameClient = new GameClient(props.game_id, playerUUID, {
                    onGameUpdate: setGame,
                    onPreloadCards: preloadCards,
                    onError: (error) => {
                        console.error("Game client error:", error);
                    },
                    onGameTermination: () => {
                        console.error("Game Terminated");
                        setGame(undefined);
                    },
                });

                gameClientRef.current = gameClient;
                gameClient.initializeGameState(initialState);
                gameClient.connect();

                preloadCards(
                    Object.values(initialState.cards).map((c) => c.card_name)
                );
            } catch (error) {
                console.error("Failed to initialize game:", error);
                if (error instanceof SyntaxError) {
                    setGame(undefined);
                }
            }
        };

        initGame();

        return () => {
            mounted = false;
            gameClientRef.current?.cleanup();
        };
    }, [props.game_id, preloadCards]);

    if (game === undefined) {
        gameClientRef.current?.cleanup();
        gameClientRef.current = null;
        return <GameError />;
    }

    if (!game || !playerUUID) return null;

    const handleAction = (action: ShahrazadAction) => {
        try {
            gameClientRef.current?.applyAction(action);
            gameClientRef.current?.broadcastAction(action);
        } catch (error) {
            console.error("Failed to handle action:", error);
        }
    };

    return (
        <Game game={game} player_uuid={playerUUID} applyAction={handleAction} />
    );
}
