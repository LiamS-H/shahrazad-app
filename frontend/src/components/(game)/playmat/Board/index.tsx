import { useDroppable } from "@dnd-kit/core";
import { useShahrazadGameContext } from "../../../../contexts/game";
import { ShahrazadZoneId } from "../../../../types/interfaces/zone";
import Card from "../../card";
import {
    ShahrazadCard,
    ShahrazadCardId,
} from "../../../../types/interfaces/card";
import type { ReactNode } from "react";
import { IDroppableData } from "../../../../types/interfaces/dnd";

const GRID_SIZE = 20;

function BoardCard(cardId: ShahrazadCardId, card: ShahrazadCard): ReactNode {
    const left = (card.x ?? 0) * GRID_SIZE;
    const top = (card.y ?? 0) * GRID_SIZE;
    return (
        <Card
            key={cardId}
            divStyle={{
                position: "absolute",
                left,
                top,
            }}
            noDragTranslate
            id={cardId}
        />
    );
}

export default function Board(props: { id: ShahrazadZoneId }) {
    const { getZone, getCard } = useShahrazadGameContext();
    const zone = getZone(props.id);
    const cards = zone.cards
        .map((id) => ({ card: getCard(id), id: id }))
        .toSorted(({ card: card1 }, { card: card2 }) => {
            card1.x ??= 0;
            card1.y ??= 0;
            card2.x ??= 0;
            card2.y ??= 0;
            if (card1.y != card2.y) {
                return card1.y - card2.y;
            }
            return card1.x - card2.x;
        });

    const data: IDroppableData = {
        grid: GRID_SIZE,
    };
    const { setNodeRef } = useDroppable({
        id: props.id,
        data,
    });
    return (
        <div
            className="shahrazad-playmat-grid"
            style={{ position: "relative" }}
            ref={setNodeRef}
        >
            {cards.map(({ id, card }) => BoardCard(id, card))}
        </div>
    );
}
