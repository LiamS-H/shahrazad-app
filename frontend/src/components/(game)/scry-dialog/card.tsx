import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ShahrazadCardId } from "@/types/bindings/card";
import Card from "@/components/(game)/card";
import { CSSProperties } from "react";

interface ScryCardProps {
    id: ShahrazadCardId;
}

export function ScryingCard({ id }: ScryCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
        zIndex: isDragging ? 999 : "auto",
        // pointerEvents: isDragging ? "none" : "auto",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative cursor-grab w-12 h-full "
            {...attributes}
            {...listeners}
        >
            <Card id={id} animationTime={null} />
        </div>
    );
}
