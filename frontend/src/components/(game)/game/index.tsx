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
import { ImportContextProvider } from "@/contexts/(game)/import";
import { ActivePlayerIcon } from "./active-player-icon";
import { NonActivePlayerIcon } from "./non-active-player-icon";
import { Separator } from "@/components/(ui)/separator";

export type ShahrazadProps = {
    game: ShahrazadGame;
    applyAction: (action: ShahrazadAction) => void;
    activePlayer: string;
    isHost: boolean;
};

export default function Game({
    game,
    applyAction,
    activePlayer,
    isHost,
}: ShahrazadProps) {
    const players = [];

    const offset = game.players.indexOf(activePlayer);
    const numPlayers = game.players.length;
    for (let i = 0; i < numPlayers; i++) {
        const player = game.players[(i + offset) % numPlayers];
        players.push(player);
    }
    const playmat_components = players.map((player) => (
        <Playmat active={player == activePlayer} player={player} key={player} />
    ));

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
                        <ImportContextProvider>
                            <Keybinds />
                            <AnimatePresence>
                                <div className="mx-4 w-ful h-ful flex flex-col gap-4">
                                    {playmat_components}
                                </div>
                            </AnimatePresence>
                            <div className="absolute top-4 right-44 flex gap-4 items-center">
                                {players.slice(1).map((player_id) => (
                                    <NonActivePlayerIcon
                                        key={player_id}
                                        player_id={player_id}
                                    />
                                ))}
                                <Separator
                                    orientation="vertical"
                                    className="h-5"
                                />
                                <ActivePlayerIcon
                                    player_id={activePlayer}
                                    is_host={isHost}
                                />
                            </div>
                        </ImportContextProvider>
                    </SearchContextProvider>
                </ShahrazadDND>
            </SelectionProvider>
        </ShahrazadGameProvider>
    );
}
