import { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IDraggableData } from "../../../../types/interfaces/dnd";
import { useShahrazadGameContext } from "../../../../contexts/game";
import { Scrycard, ScryNameCardText, useScrycard } from "react-scrycards";
import { ShahrazadCardId } from "../../../../types/interfaces/card";

export default function SortableCard(props: {
    id: ShahrazadCardId;
    index: number;
}) {
    const { getCard } = useShahrazadGameContext();
    const shah_card = getCard(props.id);
    const card = useScrycard(shah_card.card_name);

    const data: IDraggableData = {
        zone: shah_card.location,
        index: props.index,
    };
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.id, data });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        width: "fit-content",
        cursor: "grab",
        filter: isDragging ? "grayscale(100%)" : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <Scrycard card={card} symbol_text_renderer={ScryNameCardText} />
        </div>
    );
}
