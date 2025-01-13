import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ShahrazadCardId } from "@/types/bindings/card";
import { useShahrazadGameContext } from "../../../contexts/game";
import { Scrycard, ScryNameCardText, useScrycard } from "react-scrycards";
import { CSSProperties, useMemo } from "react";
import { IDraggableData } from "@/types/interfaces/dnd";
import Counters from "../playmat/Board/counters";

export default function Card(props: {
    id: ShahrazadCardId;
    noDragTranslate?: true;
    divStyle?: CSSProperties;
}) {
    const { getCard } = useShahrazadGameContext();
    const shah_card = getCard(props.id);
    const card = useScrycard(shah_card.card_name);

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

    const counters = useMemo(() => <Counters id={props.id} />, [props.id]);
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
            <Scrycard
                card={card}
                symbol_text_renderer={ScryNameCardText}
                flipped={shah_card.state.flipped}
                tapped={shah_card.state.tapped}
                faceDown={shah_card.state.face_down}
            />
            {counters}
        </div>
    );
}
