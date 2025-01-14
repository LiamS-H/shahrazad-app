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
    }, [currentPreview]);

    if (!currentPreview) return null;
    const { card_name } = getCard(currentPreview);

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
            <ScryNameCard card_name={card_name} size="xl" animated />
        </div>
    );
}
