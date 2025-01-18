import { Button } from "@/components/(ui)/button";
import { useShahrazadGameContext } from "@/contexts/game";
import { useSelection } from "@/contexts/selection";
import { FlipHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { ScryNameCard } from "react-scrycards";

export default function CardPreview() {
    const { currentPreview, setPreview } = useSelection();
    const { getCard } = useShahrazadGameContext();
    const [flipped, setFlipped] = useState<boolean | null>(null);

    useEffect(() => {
        setFlipped(null);
    }, [currentPreview]);

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
                flipped={flipped === null ? shah_card.state.flipped : flipped}
                size="xl"
                animated
            />
            <div className="relative">
                <div className="absolute bottom-1 left-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setFlipped(
                                flipped === null
                                    ? !shah_card.state.flipped
                                    : !flipped
                            );
                        }}
                    >
                        <FlipHorizontal />
                    </Button>
                </div>
            </div>
        </div>
    );
}
