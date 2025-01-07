import "./playmat.css";
import Deck from "./Deck";
import type { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import Board from "./Board";
import Hand from "./Hand";
import Graveyard from "./Graveyard";
import Exile from "./Exile";
import Command from "./Command";
import { useShahrazadGameContext } from "@/contexts/game";
import { ImportDeckButton } from "./ImportDeckButton";

export default function Playmat(props: { player: ShahrazadPlaymatId }) {
    const { getPlaymat } = useShahrazadGameContext();
    const playmat = getPlaymat(props.player);

    return (
        <div className="shahrazad-playmat">
            <div className="shahrazad-playmat-board">
                <Board id={playmat.battlefield} />
            </div>
            <div
                className="shahrazad-playmat-tray"
                style={{ position: "relative" }}
            >
                <Graveyard id={playmat.graveyard} />
                <Deck id={playmat.library} />
                <Exile id={playmat.exile} />
                <Command id={playmat.command} />
                <Hand id={playmat.hand} />
                <ImportDeckButton
                    player_uuid={props.player}
                    deckId={playmat.library}
                    commandId={playmat.command}
                />
            </div>
        </div>
    );
}
