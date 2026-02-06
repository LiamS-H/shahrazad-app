import { isFlippable, ScryNameCard, useScrycard } from "react-scrycards";

import { type ShahrazadCard } from "@/types/bindings/card";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/(ui)/button";
import { FlipHorizontal } from "lucide-react";

export function Card({
    shah_card,
    size,
}: {
    shah_card: ShahrazadCard;
    size: number;
}) {
    const [flipped, setFlipped] = useState<boolean>(shah_card.state.flipped);
    useEffect(() => {
        setFlipped(shah_card.state.flipped);
    }, [shah_card]);

    const scrycard = useScrycard(shah_card.card_name);

    return useMemo(() => {
        if (size === 0) return null;
        return (
            <div className="relative">
                <ScryNameCard
                    card_name={shah_card.card_name}
                    flipped={flipped}
                    size="xl"
                    width={`${size}px`}
                    animated
                />
                {isFlippable(scrycard) && (
                    <div className="absolute -top-4 left-8">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setFlipped((f) => !f);
                            }}
                        >
                            <FlipHorizontal
                                style={{
                                    transform: flipped
                                        ? "scaleX(-1)"
                                        : "scaleX(1)",
                                    transition: "transform 0.3s ease",
                                }}
                            />
                        </Button>
                    </div>
                )}
                {/* <div className="absolute w-full top-0 -left-full">
                    <pre className="text-foreground">
                        {JSON.stringify(shah_card, null, 2)}
                    </pre>
                </div> */}
            </div>
        );
    }, [shah_card.card_name, flipped, size, scrycard]);
}
