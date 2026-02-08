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

    const divStyle = useMemo(() => {
        const divStyle: CSSProperties = {};
        if (card.state.tapped) {
            divStyle.borderRadius = "4.75%/3.5%";
        } else {
            divStyle.borderRadius = "3.5%/4.75%";
        }
        if (!selected && card.token) {
            divStyle.outline = "4px solid hsl(var(--token-outline))";
        }
        if (selected) {
            divStyle.outline = `2px solid ${
                card.token ? "DodgerBlue" : "DarkBlue"
            }`;
            divStyle.filter = BLUE_TINT;
        }
        return divStyle;
    }, [card.token, card.state.tapped, selected]);

    const card_comp = useMemo(() => {
        if (!card.state.tapped) {
            return (
                <BoardCardContextMenu cardId={cardId}>
                    <Card id={cardId} previewDelay={100} />
                </BoardCardContextMenu>
            );
        }
        return (
            <div
                className="relative h-[100px] w-[140px] -translate-x-5 translate-y-5 cursor-grab"
                style={divStyle}
            >
                <BoardCardContextMenu cardId={cardId}>
                    <div className="left-5 -top-5 absolute rotate-90">
                        <Card
                            id={cardId}
                            width={"100px"}
                            untapped
                            previewDelay={100}
                        />
                    </div>
                </BoardCardContextMenu>
            </div>
        );
    }, [card.state.tapped, divStyle, cardId]);

    const draggableStyle: CSSProperties = card.state.tapped
        ? {
              position: "absolute",
              left,
              top,
              cursor: "default",
          }
        : {
              position: "absolute",
              left,
              top,
              ...divStyle,
          };

    if (selected) {
        draggableStyle.filter = BLUE_TINT;
    }

    return (
        <DraggableCardWrapper
            divStyle={draggableStyle}
            noDragTranslate
            id={cardId}
        >
            {card_comp}
        </DraggableCardWrapper>
    );
}
