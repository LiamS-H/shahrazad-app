import { Scrydeck } from "react-scrycards";
import { ShahrazadCardId } from "@/types/bindings/card";
import DraggableCard from "../card-draggable";
import type { ReactNode } from "react";

export default function CardStack(props: {
    cards: ShahrazadCardId[];
    emptyMessage: string | (() => ReactNode);
    dragNamespace?: string;
}) {
    const deckSize = props.cards.length;
    const dispCards: ReactNode[] = [];

    dispCards.push(
        props.emptyMessage instanceof Function ? (
            <props.emptyMessage key={"empty_deck"} />
        ) : (
            <h1
                key={"empty_text"}
                className="rounded-sm w-full h-full flex items-center justify-center text-sm text-secondary-foreground bg-secondary"
            >
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
                dragNamespace={props.dragNamespace}
                noDragTranslate
            />
        );
    } else if (deckSize > 1) {
        dispCards.push(
            <DraggableCard
                divStyle={{ position: "absolute" }}
                key={props.cards[props.cards.length - 2]}
                id={props.cards[props.cards.length - 2]}
                dragNamespace={props.dragNamespace}
                noDragTranslate
            />
        );
        dispCards.push(
            <DraggableCard
                divStyle={{ position: "absolute" }}
                key={props.cards[props.cards.length - 1]}
                id={props.cards[props.cards.length - 1]}
                dragNamespace={props.dragNamespace}
                noDragTranslate
            />
        );
    }

    return <Scrydeck count={deckSize}>{dispCards}</Scrydeck>;
}
