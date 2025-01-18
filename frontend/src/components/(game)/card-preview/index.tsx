import { useShahrazadGameContext } from "@/contexts/game";
import { useSelection } from "@/contexts/selection";
import { ScryNameCard } from "react-scrycards";

export default function CardPreview() {
    const { currentPreview, setPreview } = useSelection();
    const { getCard } = useShahrazadGameContext();

    if (currentPreview === null) return null;
    const shah_card = getCard(currentPreview);

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
            <ScryNameCard
                card_name={shah_card.card_name}
                flipped={shah_card.state.flipped}
                size="xl"
                animated
            />
        </div>
    );
}
