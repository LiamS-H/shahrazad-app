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
import GameError, { IErrorMessage } from "./error";

export default function GamePage(props: { game_id: string }) {
    const gameClientRef = useRef<GameClient | null>(null);
    const [game, setGame] = useState<ShahrazadGame | null>(null);
    const [error, setError] = useState<IErrorMessage | null>(null);

    const [playerUUID, setPlayerUUID] = useState<string | null>(null);
    const [playerName, setPlayerName] = useState<string | null>(null);
    const { preloadCards } = useScrycardsContext();

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

                const {
                    player_id,
                    player_name,
                    game: initialState,
                } = fetchResult;
                console.log("name", player_name);
                setPlayerUUID(player_id);
                setPlayerName(player_name);
                localStorage.setItem("saved-player", player_id);

                const gameClient = new GameClient(
                    props.game_id,
                    player_id,
                    player_name,
                    {
                        onGameUpdate: setGame,
                        onPreloadCards: preloadCards,
                        onError: (error) => {
                            console.error("Game client error:", error);
                        },
                        onGameTermination: () => {
                            setError({
                                status: 404,
                                message: "Game Terminated",
                                description: "This game no longer exists.",
                            });
                        },
                    }
                );

                gameClientRef.current = gameClient;
                gameClient.initializeGameState(initialState);
                gameClient.connect();

                preloadCards(
                    Object.values(initialState.cards).map((c) => c.card_name)
                );
            } catch (error) {
                if (error instanceof SyntaxError) {
                    setError({
                        status: 404,
                        message: "Game Not Found",
                        description:
                            "We couldn't find the game you are looking for.",
                    });
                    return;
                }
                console.error("Failed to initialize game:", error);
            }
        };

        initGame();

        return () => {
            mounted = false;
            gameClientRef.current?.cleanup();
        };
    }, [props.game_id, preloadCards]);

    if (error !== null) {
        gameClientRef.current?.cleanup();
        gameClientRef.current = null;
        return <GameError message={error} />;
    }

    if (!game || !playerUUID || !playerName) return null;

    const handleAction = (action: ShahrazadAction) => {
        try {
            gameClientRef.current?.applyAction(action);
            gameClientRef.current?.broadcastAction(action);
        } catch (error) {
            console.error("Failed to handle action:", error);
        }
    };

    return (
        <Game game={game} playerName={playerName} applyAction={handleAction} />
    );
}
