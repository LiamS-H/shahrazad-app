import Deck from "./Deck";
import type { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import Board from "./Board";
import Hand from "./Hand";
import Graveyard from "./Graveyard";
import Exile from "./Exile";
import Command from "./Command";
import { useShahrazadGameContext } from "@/contexts/game";
import { ImportDeckButton } from "./(buttons)/ImportDeckButton";
import Player from "./Player";
import { PlayerProvider } from "@/contexts/player";
import { UntapButton } from "./(buttons)/UntapButton";
import { ClearBoardButton } from "./(buttons)/ClearBoardButton";
import { MulliganButton } from "./(buttons)/MulliganButton";

export default function Playmat(props: {
    player: ShahrazadPlaymatId;
    active: boolean;
}) {
    const { getPlaymat } = useShahrazadGameContext();
    const playmat = getPlaymat(props.player);

    return (
        <PlayerProvider player={props.player}>
            <div className="shahrazad-playmat h-full w-full flex flex-col flex-nowrap content-between select-none">
                <div className="h-full w-full">
                    <Board id={playmat.battlefield} />
                </div>
                <div className="shahrazad-playmat-tray w-full flex flex-row flex-nowrap gap-4 relative">
                    <Graveyard id={playmat.graveyard} />
                    <Deck id={playmat.library} />

                    <Exile id={playmat.exile} />
                    <Command id={playmat.command} />
                    <Hand id={playmat.hand} active={props.active} />
                    <Player player_id={props.player} active={props.active} />
                    <div className="flex flex-col">
                        <UntapButton board_id={playmat.battlefield} />
                        <MulliganButton />
                        <ImportDeckButton
                            deckId={playmat.library}
                            commandId={playmat.command}
                            playerId={props.player}
                        />

                        <ClearBoardButton playerId={props.player} />
                    </div>
                </div>
            </div>
        </PlayerProvider>
    );
}
