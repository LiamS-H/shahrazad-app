import { CSSProperties } from "react";
import { Scrycard, ScryNameCardText, useScrycard } from "react-scrycards";
import { useShahrazadGameContext } from "../game";
import { ShahrazadCardId } from "@/types/bindings/card";

export function DraggableOverlay({ id }: { id: ShahrazadCardId }) {
    const { getCard } = useShahrazadGameContext();
    const shah_card = getCard(id);
    const card = useScrycard(shah_card.card_name);

    const style: CSSProperties = {
        // position: "relative",
        position: "absolute",
        width: "fit-content",
        cursor: "grabbing",
        // boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        // transform: "rotate(2deg)",
        zIndex: 2,
    };

    return (
        <div style={style}>
            <Scrycard
                card={card}
                symbol_text_renderer={ScryNameCardText}
                flipped={shah_card.state.flipped}
                faceDown={shah_card.state.face_down}
                tapped={shah_card.state.tapped}
            />
        </div>
    );
}
