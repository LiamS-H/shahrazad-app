import { useShahrazadGameContext } from "@/contexts/game";
import { useSelection } from "@/contexts/selection";
import { ScryNameCard } from "react-scrycards";

export default function CardPreview() {
    const { currentPreview, setPreview } = useSelection();
    const { getCard } = useShahrazadGameContext();

    if (!currentPreview) return null;
    const shah_card = getCard(currentPreview);
    if (shah_card.state.face_down) return null;

    return (
        <div
            className="fixed right-5 top-5"
            onMouseEnter={() => {
                setPreview(currentPreview);
            }}
            onMouseLeave={() => {
                setPreview(null);
            }}
        >
            <ScryNameCard card_name={shah_card.card_name} size="xl" animated />
        </div>
    );
}
