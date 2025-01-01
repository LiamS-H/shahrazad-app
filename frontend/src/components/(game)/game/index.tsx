"use client";
import { ShahrazadGame } from "@/types/bindings/game";
import Playmat from "../playmat";
import { ShahrazadGameProvider } from "@/contexts/game";
import ShahrazadDND from "@/contexts/dnd";
import { ShahrazadAction } from "@/types/bindings/action";

export type ShahrazadProps = {
    game: ShahrazadGame;
    applyAction: (action: ShahrazadAction) => void;
    player_uuid: string;
};

export default function Game(props: ShahrazadProps) {
    const playmay_components = props.game.players.map((player) => (
        <Playmat player={player} key={player} />
    ));

    return (
        <ShahrazadGameProvider
            player_uuid={props.player_uuid}
            game={props.game}
            applyAction={props.applyAction}
        >
            <ShahrazadDND>
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexFlow: "row wrap",
                    }}
                >
                    {playmay_components}
                </div>
            </ShahrazadDND>
        </ShahrazadGameProvider>
    );
}
