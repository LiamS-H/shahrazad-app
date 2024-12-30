import Card from "../../card";
import { ShahrazadCard, ShahrazadCardId } from "@/types/bindings/card";
import type { ReactNode } from "react";
import { GRID_SIZE } from ".";

export function BoardCard(
    cardId: ShahrazadCardId,
    card: ShahrazadCard
): ReactNode {
    const left = (card.state.x ?? 0) * GRID_SIZE;
    const top = (card.state.y ?? 0) * GRID_SIZE;
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
