import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ShahrazadCardId } from "@/types/bindings/card";
import { useShahrazadGameContext } from "../../../contexts/game";
import { CSSProperties } from "react";
import { IDraggableData } from "@/types/interfaces/dnd";
import Card from "../card";

export default function DraggableCard(props: {
    id: ShahrazadCardId;
    noDragTranslate?: true;
    divStyle?: CSSProperties;
}) {
    const { getCard } = useShahrazadGameContext();
    const shah_card = getCard(props.id);

    const data: IDraggableData = {
        zone: shah_card.location,
    };
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: props.id,
            data,
        });

    const draggableStyle: CSSProperties = {};
    draggableStyle.transform =
        props.noDragTranslate && isDragging
            ? undefined
            : CSS.Translate.toString(transform);

    return (
        <div
            data-shahcard={props.id}
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{
                ...draggableStyle,
                width: "fit-content",
                cursor: "grab",
                filter:
                    isDragging && props.noDragTranslate
                        ? "grayscale(100%)"
                        : undefined,
                ...props.divStyle,
            }}
        >
            <Card id={props.id} />
        </div>
    );
}
