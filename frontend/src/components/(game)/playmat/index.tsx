import "./playmat.css";
import Deck from "./Deck";
import { ShahrazadPlaymat } from "../../../types/interfaces/playmat";
import Board from "./Board";
import Hand from "./Hand";
import Graveyard from "./Graveyard";
import Exile from "./Exile";
import Command from "./Command";

export default function Playmat(props: { playmat: ShahrazadPlaymat }) {
    return (
        <div className="shahrazad-playmat">
            <div className="shahrazad-playmat-board">
                <Board id={props.playmat.battlefield} />
            </div>
            <div
                className="shahrazad-playmat-tray"
                style={{ position: "relative" }}
            >
                <Graveyard id={props.playmat.graveyard} />
                <Deck id={props.playmat.library} />
                <Exile id={props.playmat.exile} />
                <Command id={props.playmat.command} />
                <Hand id={props.playmat.hand} />
            </div>
        </div>
    );
}
