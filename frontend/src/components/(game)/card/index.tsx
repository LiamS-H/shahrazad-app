import { useShahrazadGameContext } from "@/contexts/game";
import { ShahrazadCardId } from "@/types/bindings/card";
import { Scrycard, ScryNameCardText, useScrycard } from "react-scrycards";
import Counters from "@/components/(game)/playmat/Board/counters";
import { useSelection } from "@/contexts/selection";

export default function Card(props: { id: ShahrazadCardId }) {
    const { getCard } = useShahrazadGameContext();
    const { setPreview } = useSelection();
    const shah_card = getCard(props.id);

    const card = useScrycard(shah_card.card_name);

    return (
        <div
            onMouseLeave={(e) => {
                if (e.buttons != 1) {
                    setPreview(null);
                    return;
                }
                const handler = () => {
                    window.removeEventListener("mouseup", handler);
                    setPreview(null);
                };
                window.addEventListener("mouseup", handler);
            }}
        >
            <Scrycard
                card={card}
                symbol_text_renderer={ScryNameCardText}
                flipped={shah_card.state.flipped}
                tapped={shah_card.state.tapped}
                faceDown={shah_card.state.face_down}
            />
            <Counters id={props.id} />
        </div>
    );
}
