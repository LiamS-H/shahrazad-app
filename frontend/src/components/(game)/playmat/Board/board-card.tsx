import Card from "../../card";
import { ShahrazadCard, ShahrazadCardId } from "@/types/bindings/card";
import type { ReactNode } from "react";
import { GRID_SIZE } from ".";
import BoardCardContextMenu from "../../(context-menus)/board-card";

export function BoardCard(
    cardId: ShahrazadCardId,
    card: ShahrazadCard
): ReactNode {
    const left = (card.state.x ?? 0) * GRID_SIZE;
    const top = (card.state.y ?? 0) * GRID_SIZE;
    return (
        <BoardCardContextMenu cardId={cardId} key={cardId}>
            <Card
                divStyle={{
                    position: "absolute",
                    left,
                    top,
                }}
                noDragTranslate
                id={cardId}
            />
        </BoardCardContextMenu>
    );
}
