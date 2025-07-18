import { CSSProperties, useMemo, type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IDraggableData } from "@/types/interfaces/dnd";
import { useCard } from "@/contexts/(game)/game";
import { ShahrazadCard, ShahrazadCardId } from "@/types/bindings/card";
import Card from "../../card";
import { Eye } from "lucide-react";
import HandCardContextMenu from "../../(context-menus)/hand-card";

function SortableWrapper(props: {
    id: ShahrazadCardId;
    index: number;
    shah_card: ShahrazadCard;
    children: ReactNode;
}) {
    const data: IDraggableData = {
        zone: props.shah_card.location,
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
            {props.children}
        </div>
    );
}

export default function HandCard(props: {
    id: ShahrazadCardId;
    index: number;
}) {
    const shah_card = useCard(props.id);

    return useMemo(() => {
        const display_eye =
            !shah_card.state.face_down ||
            (shah_card.state.revealed && shah_card.state.revealed.length > 1);
        return (
            <SortableWrapper
                id={props.id}
                index={props.index}
                shah_card={shah_card}
            >
                <HandCardContextMenu cardId={props.id}>
                    <Card id={props.id} animationTime={0.3}>
                        {display_eye && (
                            <div className="relative">
                                <div className="absolute bottom-[100px] w-full flex justify-center">
                                    <Eye />
                                </div>
                            </div>
                        )}
                    </Card>
                </HandCardContextMenu>
            </SortableWrapper>
        );
    }, [props.id, props.index, shah_card]);
}
