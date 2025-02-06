"use client";
import { ShahrazadGame } from "@/types/bindings/game";
import Playmat from "../playmat";
import { ShahrazadGameProvider } from "@/contexts/(game)/game";
import ShahrazadDND from "@/contexts/(game)/dnd";
import { ShahrazadAction } from "@/types/bindings/action";
import { SelectionProvider } from "@/contexts/(game)/selection";
import { SearchContextProvider } from "@/contexts/(game)/search";

export type ShahrazadProps = {
    game: ShahrazadGame;
    applyAction: (action: ShahrazadAction) => void;
    playerName: string;
};

export default function Game(props: ShahrazadProps) {
    const players = [];

    const offset = props.game.players.indexOf(props.playerName);
    const numPlayers = props.game.players.length;
    for (let i = 0; i < numPlayers; i++) {
        const player = props.game.players[(i + offset) % numPlayers];
        players.push(player);
    }
    const playmat_components = players.map((player) => (
        <Playmat
            active={player == props.playerName}
            player={player}
            key={player}
        />
    ));

    return (
        <ShahrazadGameProvider
            players={players}
            player_name={props.playerName}
            game={props.game}
            applyAction={props.applyAction}
        >
            <SelectionProvider>
                <ShahrazadDND>
                    <SearchContextProvider>
                        <div className="mx-4 w-ful h-ful flex flex-col gap-4">
                            {playmat_components}
                        </div>
                    </SearchContextProvider>
                </ShahrazadDND>
            </SelectionProvider>
        </ShahrazadGameProvider>
    );
}
