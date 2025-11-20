"use client";
import Game from "@/components/(game)/game";
import {
    ShahrazadActionCase,
    type ShahrazadAction,
} from "@/types/bindings/action";
import type { ShahrazadGame } from "@/types/bindings/game";
import { useState, useEffect, useRef, useCallback } from "react";
import { useScrycardsContext } from "react-scrycards";
import init from "shahrazad-wasm";
import { type GameClientOnMessage } from "@/lib/client";
import { LocalGameClient } from "@/lib/client/local";
import { toast } from "sonner";
import { UserProfile } from "@/components/(ui)/user-profile";
import { useRouter } from "next/navigation";
import { loadPlayer } from "@/lib/client/localPlayer";
import Loading from "../[UUID]/loading";

const activePlayer = "P0";

export default function LocalGame() {
    const router = useRouter();
    const gameClientRef = useRef<LocalGameClient | null>(null);
    const [game, setGame] = useState<ShahrazadGame | null>(null);

    const onMessageRef = useRef<null | GameClientOnMessage>(null);
    const registerOnMessage = useCallback((onMessage: GameClientOnMessage) => {
        onMessageRef.current = onMessage;
    }, []);

    const [loading, setLoading] = useState(true);
    const init_ref = useRef(false);

    const { preloadCards } = useScrycardsContext();

    const initGame = useCallback(async () => {
        if (init_ref.current) return;
        init_ref.current = true;
        await init();

        const stored_player =
            loadPlayer()?.player?.display_name ?? activePlayer;

        setLoading(false);

        const gameClient = new LocalGameClient({
            onGameUpdate: setGame,
            onPreloadCards: preloadCards,
            onToast: (message) => {
                toast(message);
            },
            onGameTermination: (reason) => {
                toast.error(reason ?? "Game Terminated");
                router.push("/");
            },
            onPlayerJoin: () => {
                toast("A new player joined.");
            },
            onMessage: (message) => {
                onMessageRef.current?.(message);
            },
        });

        gameClientRef.current = gameClient;
        gameClient.beginGame();
        gameClient.queueAction({
            type: ShahrazadActionCase.AddPlayer,
            player: {
                display_name: stored_player,
            },
            player_id: activePlayer,
        });
    }, [preloadCards, router]);

    useEffect(() => {
        initGame();

        return () => {
            gameClientRef.current?.cleanup();
        };
    }, [initGame]);

    const handleAction = useCallback((action: ShahrazadAction) => {
        try {
            gameClientRef.current?.queueAction(action);
        } catch (error) {
            console.error("Failed to handle action:", error);
        }
    }, []);

    const isLoading = loading || !game;

    return (
        <>
            {isLoading ? (
                <Loading />
            ) : (
                <Game
                    registerOnMessage={registerOnMessage}
                    game={game}
                    activePlayer={activePlayer}
                    applyAction={handleAction}
                    isHost
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
            </div>
        </>
    );
}
