"use client";
import Game from "@/components/(game)/game";
import { joinGame } from "@/lib/client/joinGame";
import { ShahrazadAction } from "@/types/bindings/action";
import { ShahrazadGame } from "@/types/bindings/game";
import { useState, useEffect, useRef, useCallback } from "react";
import { useScrycardsContext } from "react-scrycards";
import "react-scrycards/dist/index.css";
import init from "shahrazad-wasm";
import { GameClient } from "@/lib/client";
import GameError, { IErrorMessage } from "./error";
import { toast } from "sonner";
import ShareGameButton from "./ShareGameButton";
import FullscreenToggle from "./FullscreenToggle";
import { loadPlayer, savePlayer } from "@/lib/client/localPlayer";

export default function GamePage(props: { game_id: string }) {
    const gameClientRef = useRef<GameClient | null>(null);
    const [game, setGame] = useState<ShahrazadGame | null>(null);
    const [error, setError] = useState<IErrorMessage | null>(null);

    const [loading, setLoading] = useState(true);
    const init_ref = useRef(false);

    const signalError = useCallback((error: IErrorMessage) => {
        setError(error);
        toast(error.message);
    }, []);

    const [playerUUID, setPlayerUUID] = useState<string | null>(null);
    const [playerName, setPlayerName] = useState<string | null>(null);
    const [gameCode, setGameCode] = useState<number | null>(null);

    const { preloadCards } = useScrycardsContext();

    const initGame = useCallback(async () => {
        if (init_ref.current) return;
        init_ref.current = true;
        const stored_player = loadPlayer();

        const [joinResult] = await Promise.all([
            joinGame(props.game_id, stored_player),
            init(),
        ]);

        setLoading(false);

        if (joinResult === undefined) {
            signalError({
                status: 503,
                message: "Connection Refused",
                description: "Server may be down for maintenance.",
            });
            return;
        }
        if (joinResult === null) {
            signalError({
                status: 404,
                message: "Game Not Found",
                description: "We couldn't find the game you are looking for.",
            });
            return;
        }

        const { player_id, player_name, game: initialState, code } = joinResult;
        toast(`Joined game ${code}`);

        setPlayerUUID(player_id);
        setPlayerName(player_name);
        setGameCode(code);
        savePlayer(player_id);
        localStorage.setItem("saved-game", code.toString());

        const gameClient = new GameClient(
            props.game_id,
            player_id,
            player_name,
            {
                onGameUpdate: setGame,
                onPreloadCards: preloadCards,
                onMessage: (message) => {
                    toast(message);
                },
                onGameTermination: () => {
                    signalError({
                        status: 404,
                        message: "Game Terminated",
                        description:
                            "Games Close after 5 minutes of inactivity. This game no longer exists.",
                    });
                },
                onPlayerJoin: () => {
                    toast("A new player joined.");
                },
            }
        );

        gameClientRef.current = gameClient;
        gameClient.initializeGameState(initialState);
        gameClient.connect();

        preloadCards(Object.values(initialState.cards).map((c) => c.card_name));
    }, [props.game_id, preloadCards, signalError]);

    useEffect(() => {
        initGame();

        return () => {
            gameClientRef.current?.cleanup();
        };
    }, [initGame, props.game_id, preloadCards]);

    if (error !== null) {
        gameClientRef.current?.cleanup();
        gameClientRef.current = null;
        return <GameError message={error} />;
    }

    if (loading || !game || !playerUUID || !playerName) {
        return <h1>loading game...</h1>;
    }

    const handleAction = (action: ShahrazadAction) => {
        try {
            gameClientRef.current?.queueAction(action);
        } catch (error) {
            console.error("Failed to handle action:", error);
        }
    };

    return (
        <>
            <Game
                game={game}
                playerName={playerName}
                applyAction={handleAction}
            />
            <div className="absolute top-4 right-4 flex gap-4">
                <ShareGameButton code={gameCode} />
                <FullscreenToggle />
            </div>
        </>
    );
}
