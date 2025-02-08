import { Scrycard, Scrydeck } from "react-scrycards";
import { ShahrazadCardId } from "@/types/bindings/card";
import DraggableCard from "../card-draggable";
import type { ReactNode } from "react";
import { LayoutGroup, motion } from "framer-motion";

export default function CardStack(props: {
    cards: ShahrazadCardId[];
    emptyMessage: string | (() => ReactNode);
    dragNamespace?: string;
}) {
    const deckSize = props.cards.length;
    const dispCards: ReactNode[] = [];

    if (deckSize == 1) {
        dispCards.push(
            <DraggableCard
                divStyle={{ position: "absolute" }}
                key={props.cards[props.cards.length - 1]}
                id={props.cards[props.cards.length - 1]}
                dragNamespace={props.dragNamespace}
                noDragTranslate
                animationTime={0}
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
                animationTime={0}
            />
        );
        dispCards.push(
            <DraggableCard
                divStyle={{ position: "absolute" }}
                key={props.cards[props.cards.length - 1]}
                id={props.cards[props.cards.length - 1]}
                dragNamespace={props.dragNamespace}
                noDragTranslate
                animationTime={0}
            />
        );
    }

    return (
        <Scrydeck count={deckSize}>
            {props.emptyMessage instanceof Function ? (
                <props.emptyMessage key={"empty_deck"} />
            ) : (
                <h1
                    key={"empty_text"}
                    className="rounded-sm w-full h-full flex items-center justify-center text-sm text-secondary-foreground bg-secondary"
                >
                    {props.emptyMessage}
                </h1>
            )}
            {props.cards.length > 2 && (
                <div className="absolute">
                    <Scrycard card={null} faceDown />
                </div>
            )}
            <LayoutGroup>
                {props.cards.slice(0, -1).map((id) => (
                    <motion.div
                        layoutId={id}
                        key={id}
                        className="w-full h-full absolute"
                    />
                ))}
                {dispCards}
            </LayoutGroup>
        </Scrydeck>
    );
}
