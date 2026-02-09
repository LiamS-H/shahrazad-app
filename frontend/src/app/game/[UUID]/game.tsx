"use client";
import Game from "@/components/(game)/game";
import { joinGame } from "@/lib/client/joinGame";
import {
    ShahrazadActionCase,
    type ShahrazadAction,
} from "@/types/bindings/action";
import type { ShahrazadGame } from "@/types/bindings/game";
import { useState, useEffect, useRef, useCallback } from "react";
import { useScrycardsContext } from "react-scrycards";
import { GameClient, type GameClientOnMessage } from "@/lib/client";
import GameError, { IErrorMessage } from "./error";
import { toast } from "sonner";
import { ShareGameButton } from "@/components/(game)/share-game-button";
import { FullscreenToggle } from "@/components/(ui)/fullscreen-toggle";
import { loadPlayer, savePlayer } from "@/lib/client/localPlayer";
import Loading from "./loading";
import { UserProfile } from "@/components/(ui)/user-profile";
import { init_wasm } from "@/lib/client/wasm-init";
import { preloadCardImages } from "@/lib/client/preload-cards";

export default function GamePage(props: { game_id: string }) {
    const gameClientRef = useRef<GameClient | null>(null);
    const [game, setGame] = useState<ShahrazadGame | null>(null);
    const [error, setError] = useState<IErrorMessage | null>(null);

    const onMessageRef = useRef<null | GameClientOnMessage>(null);
    const registerOnMessage = useCallback((onMessage: GameClientOnMessage) => {
        onMessageRef.current = onMessage;
    }, []);

    const [loading, setLoading] = useState(true);
    const [serverLoading, setServerLoading] = useState(true);
    const init_ref = useRef(false);

    const signalError = useCallback((error: IErrorMessage) => {
        setError(error);
        gameClientRef.current?.cleanup();
        gameClientRef.current = null;
        toast(error.message);
    }, []);

    const [playerUUID, setPlayerUUID] = useState<string | null>(null);
    const [activePlayer, setActivePlayer] = useState<string | null>(null);
    const [gameCode, setGameCode] = useState<number | null>(null);
    const [isHost, setIsHost] = useState(false);

    const { preloadCards, requestCard } = useScrycardsContext();

    const initGame = useCallback(async () => {
        if (init_ref.current) return;
        init_ref.current = true;
        const stored_player = loadPlayer();
        setServerLoading(true);
        setLoading(true);
        const join_promise = joinGame(props.game_id, stored_player);
        join_promise.then(() => setServerLoading(false));
        const [joinResult] = await Promise.all([join_promise, init_wasm()]);

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

        const {
            player_id,
            player_name,
            game: initialState,
            code,
            is_host,
        } = joinResult;
        toast(`Joined game ${code}`);

        setIsHost(is_host);
        setPlayerUUID(player_id);
        setActivePlayer(player_name);
        setGameCode(code);
        savePlayer(player_id);
        localStorage.setItem("saved-game", code.toString());

        const gameClient = new GameClient(
            props.game_id,
            player_id,
            player_name,
            {
                onGameUpdate: setGame,
                onPreloadCards: (cards, images) => {
                    preloadCards(cards);

                    if (images) {
                        preloadCardImages(cards, requestCard);
                    }
                },
                onToast: (message) => {
                    toast(message);
                },
                onGameTermination: (reason) => {
                    signalError({
                        status: 404,
                        message: "Game Terminated",
                        description:
                            reason ??
                            "Games Close after 5 minutes of inactivity. This game no longer exists.",
                    });
                },
                onPlayerJoin: () => {
                    toast("A new player joined.");
                },
                onMessage: (message) => {
                    onMessageRef.current?.(message);
                },
            },
        );

        gameClientRef.current = gameClient;
        const game = gameClient.initializeGameState(initialState);
        gameClient.connect();
        setGame(game);

        preloadCards(Object.values(game.cards).map((c) => c.card_name));
    }, [props.game_id, preloadCards, requestCard, signalError]);

    useEffect(() => {
        // This is async and updating external state.
        initGame(); //eslint-disable-line react-hooks/set-state-in-effect

        return () => {
            gameClientRef.current?.cleanup();
        };
    }, [initGame, props.game_id, preloadCards]);

    const handleAction = useCallback((action: ShahrazadAction) => {
        try {
            gameClientRef.current?.queueAction(action);
        } catch (error) {
            console.error("Failed to handle action:", error);
        }
    }, []);

    if (error !== null) {
        return <GameError message={error} />;
    }

    const isLoading = loading || !game || !playerUUID || !activePlayer;

    return (
        <>
            {isLoading ? (
                <Loading server_loading={serverLoading} />
            ) : (
                <Game
                    registerOnMessage={registerOnMessage}
                    game={game}
                    activePlayer={activePlayer}
                    applyAction={handleAction}
                    isHost={isHost}
                />
            )}
            <div className="absolute top-4 right-4 flex gap-4">
                {isLoading && (
                    // don't love rendering the profile here and within the game component,
                    // but I want the player icon to appear before the game loads, and it has a dynamic width
                    <UserProfile
                        onChange={
                            activePlayer
                                ? (p) => {
                                      handleAction({
                                          type: ShahrazadActionCase.SetPlayer,
                                          player: p,
                                          player_id: activePlayer,
                                      });
                                  }
                                : undefined
                        }
                    />
                )}
                <ShareGameButton code={gameCode} />
                <FullscreenToggle />
            </div>
        </>
    );
}
