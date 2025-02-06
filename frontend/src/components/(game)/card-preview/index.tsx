import { Button } from "@/components/(ui)/button";
import { useSelection } from "@/contexts/(game)/selection";
import { ShahrazadCard } from "@/types/bindings/card";
import { FlipHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { isFlippable, ScryNameCard, useScrycard } from "react-scrycards";

export default function PreviewCard({
    shah_card,
}: {
    shah_card: ShahrazadCard;
}) {
    const [flipped, setFlipped] = useState<boolean | null>(null);

    const { currentPreview, setPreview } = useSelection();

    useEffect(() => {
        setFlipped(null);
    }, [currentPreview]);

    const scrycard = useScrycard(shah_card.card_name);
    return (
        <div
            className="fixed right-5 top-20"
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
            {isFlippable(scrycard) && (
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
            )}
        </div>
    );
}
