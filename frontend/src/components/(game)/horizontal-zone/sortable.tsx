import { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IDraggableData } from "@/types/interfaces/dnd";
import { useShahrazadGameContext } from "../../../contexts/game";
import { ShahrazadCardId } from "@/types/bindings/card";
import HandCardContextMenu from "../(context-menus)/hand-card";
import Card from "../card";
import { Eye } from "lucide-react";

export default function SortableCard(props: {
    id: ShahrazadCardId;
    index: number;
}) {
    const { getCard } = useShahrazadGameContext();
    const shah_card = getCard(props.id);

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

    const display_eye =
        !shah_card.state.face_down ||
        (shah_card.state.revealed && shah_card.state.revealed.length > 1);

    return (
        <HandCardContextMenu cardId={props.id}>
            <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
                <Card id={props.id} />
                {display_eye && (
                    <div className="relative">
                        <div className="absolute bottom-[100px] w-full flex justify-center">
                            <Eye />
                        </div>
                    </div>
                )}
            </div>
        </HandCardContextMenu>
    );
}
