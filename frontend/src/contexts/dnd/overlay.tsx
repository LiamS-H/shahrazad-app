import { type CSSProperties, useCallback, useRef, useState } from "react";
import { Scrycard, ScryNameCardText, useScrycard } from "react-scrycards";
import { useShahrazadGameContext } from "../game";
import { ShahrazadCardId } from "@/types/bindings/card";
import { clamp } from "@/lib/clamp";

export function DraggableOverlay({ id }: { id: ShahrazadCardId }) {
    const { getCard } = useShahrazadGameContext();
    const shah_card = getCard(id);
    const card = useScrycard(shah_card.card_name);

    const animationFrameId = useRef<number | null>(null);
    const mousePosition = useRef<{ x: number; y: number } | null>(null);
    const [rotation, setRotation] = useState({ rotateX: 0, rotateY: 0 });

    const style: CSSProperties = {
        position: "absolute",
        width: "fit-content",
        cursor: "grabbing",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        transition: "transform 0.2s ease-out",
        transform: `perspective(1000px) rotateX(${rotation.rotateX}deg) rotateY(${rotation.rotateY}deg)`,
        zIndex: 2,
    };

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const { clientX, clientY } = e;
            const prevX = mousePosition.current?.x;
            const prevY = mousePosition.current?.y;
            mousePosition.current = { x: clientX, y: clientY };
            if (!prevX || !prevY) return;

            const dX = clamp(prevX - clientX, -1, 1);
            const dY = clamp(prevY - clientY, -1, 1);
            const strength = 20;

            const rotateX = dY * strength;
            const rotateY = -dX * strength;

            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }

            animationFrameId.current = requestAnimationFrame(() => {
                setRotation({ rotateX, rotateY });
                animationFrameId.current = requestAnimationFrame(() => {
                    setRotation({ rotateX: 0, rotateY: 0 });
                });
            });
        },
        []
    );

    return (
        <div style={style} onMouseMove={handleMouseMove}>
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
