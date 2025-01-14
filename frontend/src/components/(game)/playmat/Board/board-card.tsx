import DraggableCard from "@/components/(game)/card-draggable";
import { ShahrazadCard, ShahrazadCardId } from "@/types/bindings/card";
import type { CSSProperties, ReactNode } from "react";
import { GRID_SIZE } from ".";
import BoardCardContextMenu from "@/components/(game)/(context-menus)/board-card";

const BLUE_TINT = `url('data:image/svg+xml,\
  <svg xmlns="http://www.w3.org/2000/svg">\
    <filter id="blue-tint">\
      <feColorMatrix type="matrix" \
        values="\
          0.6 0 0 0 0\
          0 0.6 0 0 0\
          0 0 1.4 0 0\
          0 0 0 1 0"\
      />\
    </filter>\
  </svg>#blue-tint')`;

export function BoardCard({
    cardId,
    card,
    selected,
}: {
    cardId: ShahrazadCardId;
    card: ShahrazadCard;
    selected: boolean;
}): ReactNode {
    const left = (card.state.x ?? 0) * GRID_SIZE;
    const top = (card.state.y ?? 0) * GRID_SIZE;

    const divStyle: CSSProperties = {
        position: "absolute",
        left,
        top,
    };
    if (selected) {
        divStyle.outline = "1px solid blue";
        divStyle.filter = BLUE_TINT;
    }
    return (
        <BoardCardContextMenu cardId={cardId}>
            <DraggableCard divStyle={divStyle} noDragTranslate id={cardId} />
        </BoardCardContextMenu>
    );
}
