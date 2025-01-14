"use client";
import { ShahrazadGame } from "@/types/bindings/game";
import Playmat from "../playmat";
import { ShahrazadGameProvider } from "@/contexts/game";
import ShahrazadDND from "@/contexts/dnd";
import { ShahrazadAction } from "@/types/bindings/action";
import { SelectionProvider } from "@/contexts/selection";

export type ShahrazadProps = {
    game: ShahrazadGame;
    applyAction: (action: ShahrazadAction) => void;
    player_uuid: string;
};

export default function Game(props: ShahrazadProps) {
    const playmat_components = props.game.players.map((player) => (
        <Playmat
            active={player == props.player_uuid}
            player={player}
            key={player}
        />
    ));

    return (
        <ShahrazadGameProvider
            player_uuid={props.player_uuid}
            game={props.game}
            applyAction={props.applyAction}
        >
            <SelectionProvider>
                <ShahrazadDND>
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexFlow: "row wrap",
                        }}
                    >
                        {playmat_components}
                    </div>
                </ShahrazadDND>
            </SelectionProvider>
        </ShahrazadGameProvider>
    );
}
