import { Scrydeck } from "react-scrycards";
import { ShahrazadCardId } from "@/types/bindings/card";
import DraggableCard from "../card-draggable";
import type { ReactNode } from "react";

export default function CardStack(props: {
    cards: ShahrazadCardId[];
    emptyMessage: string | (() => ReactNode);
}) {
    const deckSize = props.cards.length;
    const dispCards: ReactNode[] = [];

    dispCards.push(
        props.emptyMessage instanceof Function ? (
            <props.emptyMessage key={"empty_deck"} />
        ) : (
            <h1 key={"empty_text"} style={{ color: "white" }}>
                {props.emptyMessage}
            </h1>
        )
    );
    if (deckSize == 1) {
        dispCards.push(
            <DraggableCard
                divStyle={{ position: "absolute" }}
                key={props.cards[props.cards.length - 1]}
                id={props.cards[props.cards.length - 1]}
                noDragTranslate
            />
        );
    } else if (deckSize > 1) {
        dispCards.push(
            <DraggableCard
                divStyle={{ position: "absolute" }}
                key={props.cards[props.cards.length - 2]}
                id={props.cards[props.cards.length - 2]}
                noDragTranslate
            />
        );
        dispCards.push(
            <DraggableCard
                divStyle={{ position: "absolute" }}
                key={props.cards[props.cards.length - 1]}
                id={props.cards[props.cards.length - 1]}
                noDragTranslate
            />
        );
    }

    return <Scrydeck count={deckSize}>{dispCards}</Scrydeck>;
}
