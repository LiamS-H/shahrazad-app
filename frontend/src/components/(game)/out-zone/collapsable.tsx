import { CSSProperties, useMemo } from "react";
import { IDraggableData } from "@/types/interfaces/dnd";
import { useCard } from "@/contexts/(game)/game";
import { ShahrazadCardId } from "@/types/bindings/card";
import { useDraggable } from "@dnd-kit/core";
import Card from "@/components/(game)/card";

export function Collapsable(props: {
    id: ShahrazadCardId;
    isHovered: boolean;
    isBottom: boolean;
    setHovered: (arg0: ShahrazadCardId | null) => void;
}) {
    const shah_card = useCard(props.id);

    const data: IDraggableData = useMemo(
        () => ({
            zone: shah_card.location,
        }),
        [shah_card],
    );

    const { attributes, listeners, node, setNodeRef, isDragging } =
        useDraggable({ id: props.id, data });
    const isActive = document.activeElement == node.current || props.isHovered;
    const isFirst = props.isBottom;

    const style: CSSProperties = {
        width: "fit-content",
        cursor: "grab",
        filter: isDragging ? "grayscale(100%)" : undefined,
        marginBottom: isActive && !isFirst ? "0px" : "-121px",
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
            <Card id={props.id} animationTime={0} />
        </div>
    );
}
