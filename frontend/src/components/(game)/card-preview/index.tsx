import { useShahrazadGameContext } from "@/contexts/game";
import { useSelection } from "@/contexts/selection";
import { useEffect, useRef } from "react";
import { ScryNameCard } from "react-scrycards";

export default function CardPreview() {
    const { currentPreview, setPreview } = useSelection();
    const { getCard } = useShahrazadGameContext();
    const timeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            setPreview(null);
        }, 1000);
        return () => {
            if (timeout.current) clearTimeout(timeout.current);
        };
    }, [currentPreview, setPreview]);

    if (!currentPreview) return null;
    const shah_card = getCard(currentPreview);
    if (shah_card.state.face_down) return null;

    return (
        <div
            className="fixed right-5 top-5"
            onMouseEnter={() => {
                if (timeout.current) clearTimeout(timeout.current);
            }}
            onMouseLeave={() => {
                timeout.current = setTimeout(() => {
                    setPreview(null);
                }, 1000);
            }}
        >
            <ScryNameCard card_name={shah_card.card_name} size="xl" animated />
        </div>
    );
}
