import { useShahrazadGameContext } from "@/contexts/game";
import { ShahrazadCardId } from "@/types/bindings/card";
import { Scrycard, ScryNameCardText, useScrycard } from "react-scrycards";
import Counters from "@/components/(game)/playmat/Board/counters";

export default function Card(props: { id: ShahrazadCardId }) {
    const { getCard } = useShahrazadGameContext();
    const shah_card = getCard(props.id);

    const card = useScrycard(shah_card.card_name);

    return (
        <>
            <Scrycard
                card={card}
                symbol_text_renderer={ScryNameCardText}
                flipped={shah_card.state.flipped}
                tapped={shah_card.state.tapped}
                faceDown={shah_card.state.face_down}
            />
            <Counters id={props.id} />
        </>
    );
}
