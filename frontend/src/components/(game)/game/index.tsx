"use client";
import { ShahrazadGame } from "@/types/bindings/game";
import Playmat from "../playmat";
import { ShahrazadGameProvider } from "@/contexts/game";
import { GameMoveApplier } from "@/types/reducers/game";
import ShahrazadDND from "@/contexts/dnd";

export type ShahrazadProps = {
    game: ShahrazadGame;
    applyMove: GameMoveApplier;
};

export default function Game(props: ShahrazadProps) {
    const playmay_components = props.game.playmats.map((p, i) => (
        <Playmat playmat={p} key={i} />
    ));

    return (
        <ShahrazadGameProvider game={props.game} applier={props.applyMove}>
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
