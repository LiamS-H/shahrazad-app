import Deck from "./Deck";
import type { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import Board from "./Board";
import Hand from "./Hand";
import Graveyard from "./Graveyard";
import Exile from "./Exile";
import Command from "./Command";
import { useShahrazadGameContext } from "@/contexts/game";
import Player from "./Player";
import { PlayerProvider } from "@/contexts/player";
import { UntapButton } from "./(buttons)/UntapButton";
import { MulliganButton } from "./(buttons)/MulliganButton";

export default function Playmat(props: {
    player: ShahrazadPlaymatId;
    active: boolean;
}) {
    const { getPlaymat } = useShahrazadGameContext();
    const playmat = getPlaymat(props.player);

    return (
        <PlayerProvider player={props.player} active={props.active}>
            {/* Full height should be px without gaps */}
            <div className="w-fit h-fit flex gap-4 select-none">
                <div className="flex flex-col gap-3">
                    <Player />
                    <Exile id={playmat.exile} />
                    <Graveyard id={playmat.graveyard} />
                    <Deck id={playmat.library} />
                    <div className="flex justify-around z-10">
                        <UntapButton board_id={playmat.battlefield} />
                        <MulliganButton />
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <Board id={playmat.battlefield} />
                    <div
                        className={`flex gap-4 ${
                            props.active && "text-cyan-300"
                        }`}
                    >
                        <Command id={playmat.command} />
                        <Hand id={playmat.hand} />
                    </div>
                </div>
            </div>
        </PlayerProvider>
    );
}
