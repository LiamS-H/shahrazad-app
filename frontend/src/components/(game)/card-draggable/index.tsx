import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ShahrazadCardId } from "@/types/bindings/card";
import { useCard } from "@/contexts/(game)/game";
import { CSSProperties, ReactNode, useEffect, useMemo } from "react";
import { IDraggableData } from "@/types/interfaces/dnd";
import Card from "../card";

interface DraggableCardWrapperProps {
    id: ShahrazadCardId;
    noDragTranslate?: true;
    dragDisabled?: true;
    dragNamespace?: string;
    divStyle?: CSSProperties;
    children: ReactNode;
}

type DraggableCardProps = Omit<DraggableCardWrapperProps, "children"> & {
    animationTime?: number | null;
};

export function DraggableCard({
    id,
    animationTime,
    ...props
}: DraggableCardProps) {
    return (
        <DraggableCardWrapper id={id} {...props}>
            <Card id={id} animationTime={animationTime} />
        </DraggableCardWrapper>
    );
}

export function DraggableCardWrapper(props: DraggableCardWrapperProps) {
    const shah_card = useCard(props.id);

    const data: IDraggableData = useMemo(
        () => ({
            zone: shah_card.location,
        }),
        [shah_card]
    );
    const drag_id = props.dragNamespace
        ? `${props.dragNamespace}:${props.id}`
        : props.id;
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: drag_id,
            data,
            disabled: props.dragDisabled,
        });

    const draggableStyle: CSSProperties = useMemo(() => {
        const draggableStyle: CSSProperties = {};
        if (!(props.noDragTranslate && isDragging)) {
            draggableStyle.transform = CSS.Translate.toString(transform);
        }
        if (isDragging && props.noDragTranslate) {
            draggableStyle.filter = "grayscale(100%)";
        }
        return draggableStyle;
    }, [transform, isDragging, props.noDragTranslate]);

    return useMemo(() => {
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
                }}
            >
                {props.children}
            </div>
        );
    }, [
        attributes,
        draggableStyle,
        listeners,
        props.children,
        props.divStyle,
        setNodeRef,
    ]);
}
