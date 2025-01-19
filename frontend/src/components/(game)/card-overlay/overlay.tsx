import {
    type CSSProperties,
    type ReactNode,
    useCallback,
    useRef,
    useState,
} from "react";
import { ScryNameCard } from "react-scrycards";
import { useShahrazadGameContext } from "@/contexts/game";
import { ShahrazadCardId } from "@/types/bindings/card";
import { clamp } from "@/lib/utils/clamp";
import { useSelection } from "@/contexts/selection";

function OverlayWrapper({ children }: { children: ReactNode }) {
    const animationFrameId = useRef<number | null>(null);
    const mousePosition = useRef<{ x: number; y: number } | null>(null);
    const [rotation, setRotation] = useState({ rotateX: 0, rotateY: 0 });

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
    const style: CSSProperties = {
        position: "absolute",
        width: "fit-content",
        cursor: "grabbing",
        transition: "transform 0.2s ease-out",
        transform: `perspective(1000px) rotateX(${rotation.rotateX}deg) rotateY(${rotation.rotateY}deg)`,
        zIndex: 2,
    };
    return (
        <div style={style} onMouseMove={handleMouseMove}>
            {children}
        </div>
    );
}

export function DraggableOverlay({ id }: { id: ShahrazadCardId }) {
    const { getCard, player_name } = useShahrazadGameContext();
    const shah_card = getCard(id);
    const { selectedCards } = useSelection();

    const cards = selectedCards.length === 0 ? [id] : selectedCards;

    return (
        <OverlayWrapper>
            {/* {cards.map((id) => {
                const card = getCard(id);
                let xOffset = 0;
                let yOffset = 0;
                const style: CSSProperties = {};
                if (
                    card.state.x !== undefined &&
                    card.state.y !== undefined &&
                    shah_card.state.x !== undefined &&
                    shah_card.state.y !== undefined &&
                    selectedCards.length !== 0
                ) {
                    xOffset = (card.state.x - shah_card.state.x) * 20;
                    yOffset = (card.state.y - shah_card.state.y) * 20;
                    style.transform = `translate(${xOffset}px, ${yOffset}px)`;
                    style.position = "absolute";
                    // style.top = "-140px";
                }
                return (
                    <div style={style} key={id}>
                        <ScryNameCard
                            card_name={card.card_name}
                            flipped={shah_card.state.flipped}
                            faceDown={
                                shah_card.state.face_down &&
                                !shah_card.state.revealed?.includes(player_name)
                            }
                            tapped={shah_card.state.tapped}
                        />
                    </div>
                );
            })} */}
            <ScryNameCard
                card_name={shah_card.card_name}
                flipped={shah_card.state.flipped}
                faceDown={
                    shah_card.state.face_down &&
                    !shah_card.state.revealed?.includes(player_name)
                }
                tapped={shah_card.state.tapped}
            />
            {selectedCards.length !== 0 && (
                <div className="relative">
                    <div className="absolute bottom-[120px] w-6 h-6 right-0 rounded-full bg-destructive flex justify-center items-center">
                        {selectedCards.length}
                    </div>
                </div>
            )}
        </OverlayWrapper>
    );
}
