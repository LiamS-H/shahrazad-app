"use client";
import Game from "@/components/(game)/game";
import {
    ShahrazadActionCase,
    type ShahrazadAction,
} from "@/types/bindings/action";
import type {
    ShahrazadGame,
    ShahrazadGameSettings,
} from "@/types/bindings/game";
import { useState, useEffect, useRef, useCallback } from "react";
import { useScrycardsContext } from "react-scrycards";
import { type GameClientOnMessage } from "@/lib/client";
import { LocalGameClient } from "@/lib/client/local";
import { toast } from "sonner";
import { UserProfile } from "@/components/(ui)/user-profile";
import { useRouter, useSearchParams } from "next/navigation";
import { loadPlayer } from "@/lib/client/localPlayer";
import Loading from "../[UUID]/loading";
import { FullscreenToggle } from "@/components/(ui)/fullscreen-toggle";
import { SaveStatesButton } from "./save-states-button";
import { init_wasm } from "@/lib/client/wasm-init";
import { preloadCardImages } from "@/lib/client/preload-cards";

const activePlaymat = 0;

export default function LocalGame() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const gameClientRef = useRef<LocalGameClient | null>(null);
    const [game, setGame] = useState<ShahrazadGame | null>(null);

    const onMessageRef = useRef<null | GameClientOnMessage>(null);
    const registerOnMessage = useCallback((onMessage: GameClientOnMessage) => {
        onMessageRef.current = onMessage;
    }, []);

    const [loading, setLoading] = useState(true);
    const init_ref = useRef(false);

    const { preloadCards, requestCard } = useScrycardsContext();

    const loadCode = useCallback((code: string | null) => {
        if (!gameClientRef.current) {
            toast.error("Couldn't load code; gamestate not initialized");
            return false;
        }
        if (code === null) {
            return false;
        }
        if (code === "") {
            toast.info("Couldn't load empty code");
            return false;
        }
        const game = gameClientRef.current.beginGame(undefined, code);
        if (!game) {
            toast.error("Couldn't load code; gamestate failed initialization");
            return false;
        }
        toast.success("Game restored from code");
        return true;
    }, []);

    const loadSettings = useCallback(
        (settings: ShahrazadGameSettings | null) => {
            if (!gameClientRef.current) {
                return false;
            }
            if (!settings) {
                return false;
            }

            const game = gameClientRef.current.beginGame(settings);
            if (!game) {
                toast.error("Couldn't load settings");
                return false;
            }
            toast.success("Game created from settings");
            return true;
        },
        [],
    );

    const initGame = useCallback(async () => {
        if (init_ref.current) return;
        init_ref.current = true;
        await init_wasm();

        const stored_player =
            loadPlayer()?.player?.display_name ?? activePlaymat;

        setLoading(false);

        const gameClient = new LocalGameClient({
            onGameUpdate: (game) => {
                setGame(game);
            },
            onPreloadCards: (cards, images) => {
                preloadCards(cards);
                if (images) {
                    preloadCardImages(cards, requestCard);
                }
            },
            toast,
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
        if (loadCode(searchParams.get("code"))) {
            return;
        }
        const settings_string = searchParams.get("settings") ?? "";
        let settings: ShahrazadGameSettings | null = null;
        try {
            settings = JSON.parse(settings_string);
        } catch {}
        if (!loadSettings(settings)) {
            gameClientRef.current.beginGame();
        }
        gameClient.queueAction({
            type: ShahrazadActionCase.AddPlayer,
            player: {
                display_name: stored_player || `P${activePlaymat}`,
            },
            player_id: activePlaymat,
        });
    }, [
        loadCode,
        loadSettings,
        preloadCards,
        requestCard,
        router,
        searchParams,
    ]);

    useEffect(() => {
        // This is async and updating external state.
        initGame(); //eslint-disable-line react-hooks/set-state-in-effect

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
                    activePlayer={activePlaymat}
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
                            activePlaymat
                                ? (p) => {
                                      handleAction({
                                          type: ShahrazadActionCase.SetPlayer,
                                          player: p,
                                          player_id: activePlaymat,
                                      });
                                  }
                                : undefined
                        }
                    />
                )}
                <SaveStatesButton
                    getCode={
                        isLoading
                            ? null
                            : () => gameClientRef.current?.encode() ?? ""
                    }
                    loadCode={loadCode}
                />
                <FullscreenToggle />
            </div>
        </>
    );
}
