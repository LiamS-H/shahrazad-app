import { Scrydeck } from "react-scrycards";
import { ShahrazadCardId } from "../../../../types/interfaces/card";
import Card from "../../card";
import type { ReactNode } from "react";

export default function StackZone(props: { cards: ShahrazadCardId[] }) {
    const deckSize = props.cards.length;
    const dispCards: ReactNode[] = [];

    dispCards.push(
        <h1 key={"empty_text"} style={{ color: "white" }}>
            empty
        </h1>
    );
    if (deckSize == 1) {
        dispCards.push(<Card key={props.cards[0]} id={props.cards[0]} />);
    } else if (deckSize > 1) {
        dispCards.push(<Card key={props.cards[1]} id={props.cards[1]} />);
        dispCards.push(<Card key={props.cards[0]} id={props.cards[0]} />);
    }

    return <Scrydeck count={deckSize}>{dispCards}</Scrydeck>;
}
