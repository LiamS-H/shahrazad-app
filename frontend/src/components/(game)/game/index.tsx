"use client";
import { ShahrazadGame } from "@/types/bindings/game";
import Playmat from "../playmat";
import { ShahrazadGameProvider } from "@/contexts/(game)/game";
import ShahrazadDND from "@/contexts/(game)/dnd";
import { ShahrazadAction } from "@/types/bindings/action";
import { SelectionProvider } from "@/contexts/(game)/selection";
import { SearchContextProvider } from "@/contexts/(game)/search";
import { AnimatePresence } from "framer-motion";
import { Keybinds } from "../keybinds";
import { ArrowsContextProvider } from "@/contexts/(game)/arrows";
import { ImportContextProvider } from "@/contexts/(game)/import";
import { ActivePlayerIcon } from "./active-player-icon";
import { NonActivePlayerIcon } from "./non-active-player-icon";
import { Separator } from "@/components/(ui)/separator";
import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { MessagesContextProvider } from "@/contexts/(game)/messages";
import { GameClientOnMessage } from "@/lib/client";
import { Arrows } from "@/components/(game)/arrow";

export type ShahrazadProps = {
    game: ShahrazadGame;
    applyAction: (action: ShahrazadAction) => void;
    activePlayer: string;
    isHost: boolean;
    registerOnMessage: (onMessage: GameClientOnMessage) => void;
};

export default function Game({
    game,
    applyAction,
    activePlayer,
    isHost,
    registerOnMessage,
}: ShahrazadProps) {
    const p = game.players.join();
    const players = useMemo(() => {
        const players: string[] = [];

        const offset = game.players.indexOf(activePlayer);
        const numPlayers = game.players.length;
        for (let i = 0; i < numPlayers; i++) {
            const player = game.players[(i + offset) % numPlayers];
            players.push(player);
        }
        return players;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePlayer, p]);

    const scroll_ref = useRef<HTMLDivElement>(null);
    const colVirtualizer = useVirtualizer({
        count: players.length,
        getScrollElement: () => scroll_ref.current,
        estimateSize: () => 657 + 16,
        overscan: 0,
    });

    return (
        <ShahrazadGameProvider
            players={players}
            player_name={activePlayer}
            game={game}
            applyAction={applyAction}
            isHost={isHost}
        >
            <SelectionProvider>
                <ShahrazadDND>
                    <SearchContextProvider>
                        <MessagesContextProvider
                            registerOnMessage={registerOnMessage}
                        >
                            <ImportContextProvider>
                                <ArrowsContextProvider>
                                    <Keybinds />
                                    <AnimatePresence>
                                        <div
                                            className="pl-4 w-full overflow-y-auto relative"
                                            ref={scroll_ref}
                                        >
                                            <Arrows parentRef={scroll_ref} />
                                            <div
                                                style={{
                                                    height: `${colVirtualizer.getTotalSize()}px`,
                                                    position: "relative",
                                                }}
                                            >
                                                {colVirtualizer
                                                    .getVirtualItems()
                                                    .map((virtualItem) => {
                                                        const player =
                                                            players[
                                                                virtualItem
                                                                    .index
                                                            ];
                                                        return (
                                                            <div
                                                                style={{
                                                                    position:
                                                                        "absolute",
                                                                    top: `${virtualItem.start}px`,
                                                                    width: "100%",
                                                                }}
                                                                key={player}
                                                            >
                                                                <Playmat
                                                                    active={
                                                                        player ==
                                                                        activePlayer
                                                                    }
                                                                    player={
                                                                        player
                                                                    }
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                {players.map((player, i) => (
                                                    <div
                                                        key={player}
                                                        id={`player-${player}`}
                                                        style={{
                                                            position:
                                                                "absolute",
                                                            top: `${
                                                                i * (657 + 16)
                                                            }px`,
                                                            width: "100%",
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </AnimatePresence>
                                    <div className="absolute top-4 right-44 flex gap-4 items-center">
                                        {players.slice(1).map((player_id) => (
                                            <NonActivePlayerIcon
                                                key={player_id}
                                                player_id={player_id}
                                            />
                                        ))}
                                        {players.length > 1 && (
                                            <Separator
                                                orientation="vertical"
                                                className="h-5"
                                            />
                                        )}
                                        <ActivePlayerIcon
                                            player_id={activePlayer}
                                            is_host={isHost}
                                        />
                                    </div>
                                </ArrowsContextProvider>
                            </ImportContextProvider>
                        </MessagesContextProvider>
                    </SearchContextProvider>
                </ShahrazadDND>
            </SelectionProvider>
        </ShahrazadGameProvider>
    );
}
