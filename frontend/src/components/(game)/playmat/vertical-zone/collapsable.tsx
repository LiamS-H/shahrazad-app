import { CSSProperties } from "react";
import { IDraggableData } from "../../../../types/interfaces/dnd";
import { useShahrazadGameContext } from "../../../../contexts/game";
import { Scrycard, ScryNameCardText, useScrycard } from "react-scrycards";
import { ShahrazadCardId } from "../../../../types/interfaces/card";
import { useDraggable } from "@dnd-kit/core";

export default function CollapseableCard(props: {
    id: ShahrazadCardId;
    isHovered: boolean;
    isBottom: boolean;
    setHovered: (arg0: string | null) => void;
}) {
    const { getCard } = useShahrazadGameContext();
    const shah_card = getCard(props.id);
    const card = useScrycard(shah_card.card_name);

    const data: IDraggableData = {
        zone: shah_card.location,
    };
    const { attributes, listeners, node, setNodeRef, isDragging } =
        useDraggable({ id: props.id, data });
    const isActive = document.activeElement == node.current || props.isHovered;
    const isFirst = props.isBottom;

    const style: CSSProperties = {
        width: "fit-content",
        cursor: "grab",
        filter: isDragging ? "grayscale(100%)" : undefined,
        marginBottom: isActive && !isFirst ? "0px" : "-125px",
        transition: "margin 0.3s ease-in-out",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onMouseEnter={() => props.setHovered(props.id)}
            onMouseLeave={() => props.setHovered(null)}
            onFocus={() => props.setHovered(props.id)}
            onBlur={() => props.setHovered(null)}
        >
            <Scrycard
                card={card}
                symbol_text_renderer={ScryNameCardText}
                flippable
            />
        </div>
    );
}
