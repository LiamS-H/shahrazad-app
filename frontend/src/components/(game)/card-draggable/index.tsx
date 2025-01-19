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
    dragDisabled?: true;
    dragNamespace?: string;
    divStyle?: CSSProperties;
}) {
    const { getCard } = useShahrazadGameContext();
    const shah_card = getCard(props.id);

    const data: IDraggableData = {
        zone: shah_card.location,
    };
    const drag_id = props.dragNamespace
        ? `${props.dragNamespace}:${props.id}`
        : props.id;
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: drag_id,
            data,
            disabled: props.dragDisabled,
        });

    const draggableStyle: CSSProperties = {};
    draggableStyle.transform =
        props.noDragTranslate && isDragging
            ? undefined
            : CSS.Translate.toString(transform);

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{
                ...draggableStyle,
                width: "fit-content",
                cursor: "grab",
                ...props.divStyle,
                filter:
                    isDragging && props.noDragTranslate
                        ? "grayscale(100%)"
                        : undefined,
            }}
        >
            <Card id={props.id} />
        </div>
    );
}
