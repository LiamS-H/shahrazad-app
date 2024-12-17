import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ShahrazadCardId } from "../../../types/interfaces/card";
import { useShahrazadGameContext } from "../../../contexts/game";
import { Scrycard, ScryNameCardText, useScrycard } from "react-scrycards";
import { CSSProperties } from "react";
import { IDraggableData } from "../../../types/interfaces/dnd";

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

    return (
        <div
            data-shahcard={props.id}
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{
                ...props.divStyle,
                ...draggableStyle,
                width: "fit-content",
                cursor: "grab",
            }}
        >
            <Scrycard
                card={card}
                symbol_text_renderer={ScryNameCardText}
                flipped={shah_card.flipped}
                tapped={shah_card.tapped}
                faceDown={shah_card.face_down}
            />
        </div>
    );
}
