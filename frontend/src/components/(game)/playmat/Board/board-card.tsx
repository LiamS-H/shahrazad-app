import { DraggableCardWrapper } from "@/components/(game)/card-draggable";
import { ShahrazadCard, ShahrazadCardId } from "@/types/bindings/card";
import { useMemo, type CSSProperties } from "react";
import { GRID_SIZE } from ".";
import BoardCardContextMenu from "@/components/(game)/(context-menus)/board-card";
import Card from "../../card";

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
}) {
    const left = (card.state.x ?? 0) * GRID_SIZE;
    const top = (card.state.y ?? 0) * GRID_SIZE;

    const divStyle: CSSProperties = {
        position: "absolute",
        left,
        top,

        borderRadius: "4.75% / 3.5%",
    };
    if (!selected && card.token) {
        divStyle.outline = "4px solid hsl(var(--token-outline))";
    }
    if (selected) {
        divStyle.outline = `2px solid ${
            card.token ? "DodgerBlue" : "DarkBlue"
        }`;
        divStyle.filter = BLUE_TINT;
        divStyle.borderRadius = "4.75% / 3.5%";
    }

    const card_comp = useMemo(
        () => <Card id={cardId} previewDelay={100} />,
        [cardId]
    );

    return (
        <DraggableCardWrapper divStyle={divStyle} noDragTranslate id={cardId}>
            <BoardCardContextMenu cardId={cardId}>
                {card_comp}
            </BoardCardContextMenu>
        </DraggableCardWrapper>
    );
}
