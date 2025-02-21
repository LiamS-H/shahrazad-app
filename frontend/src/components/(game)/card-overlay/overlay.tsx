import {
    type CSSProperties,
    type ReactNode,
    useCallback,
    useRef,
    useState,
} from "react";
import { ScryNameCard } from "react-scrycards";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadCard, ShahrazadCardId } from "@/types/bindings/card";
import { clamp } from "@/lib/utils/clamp";
import { useSelection } from "@/contexts/(game)/selection";
import { GRID_SIZE } from "../playmat/Board";

function SingleCard({
    card,
    faceup,
    selected,
    rotation,
}: {
    card: ShahrazadCard;
    faceup?: boolean;
    selected?: number;
    rotation: Rotation;
}) {
    return (
        <RotationWrapper rotation={rotation}>
            <div
                style={
                    card.token
                        ? {
                              outline: "4px solid hsl(var(--token-outline))",
                              borderRadius: "4.75% / 3.5%",
                          }
                        : undefined
                }
            >
                <ScryNameCard
                    card_name={card.card_name}
                    flipped={card.state.flipped}
                    faceDown={card.state.face_down && !faceup}
                    tapped={card.state.tapped}
                />
                {selected && (
                    <div className="relative">
                        <div className="absolute bottom-[120px] w-6 h-6 right-0 rounded-full bg-destructive text-destructive-foreground flex justify-center items-center">
                            {selected}
                        </div>
                    </div>
                )}
            </div>
        </RotationWrapper>
    );
}

type Rotation = [number, number];

function useRotation() {
    const animationFrameId = useRef<number | null>(null);
    const mousePosition = useRef<{ x: number; y: number } | null>(null);
    const [rotation, setRotation] = useState<Rotation>([0, 0]);
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
                setRotation([rotateX, rotateY]);
                animationFrameId.current = requestAnimationFrame(() => {
                    setRotation([0, 0]);
                });
            });
        },
        []
    );
    return { handleMouseMove, rotation };
}

function RotationWrapper({
    children,
    rotation,
}: {
    children: ReactNode;
    rotation: Rotation;
}) {
    const style: CSSProperties = {
        transition: "transform 0.2s ease-out",
        transform: `perspective(1000px) rotateX(${rotation[0]}deg) rotateY(${rotation[1]}deg)`,
    };
    return <div style={style}>{children}</div>;
}

export function DraggableOverlay({ id }: { id: ShahrazadCardId }) {
    const { getCard, active_player: player_name } = useShahrazadGameContext();
    const main_card = getCard(id);
    const { selectedCards } = useSelection();
    const { handleMouseMove, rotation } = useRotation();

    const main_card_comp = (
        <div onMouseMove={handleMouseMove} className="absolute">
            <SingleCard
                rotation={rotation}
                card={main_card}
                faceup={main_card.state.revealed?.includes(player_name)}
                selected={
                    selectedCards.includes(id)
                        ? selectedCards.length
                        : undefined
                }
            />
        </div>
    );

    if (main_card.state.x === undefined || main_card.state.y === undefined) {
        return main_card_comp;
    }

    const cards =
        selectedCards.length === 0 || !selectedCards.includes(id)
            ? [id]
            : selectedCards;

    if (cards.length === 1) {
        return main_card_comp;
    }

    const card_list = [];
    for (const id of cards) {
        const card = getCard(id);
        if (card.state.x === undefined || card.state.y === undefined) {
            return main_card_comp;
        }
        const xOffset = -(main_card.state.x - card.state.x) * GRID_SIZE;
        const yOffset = -(main_card.state.y - card.state.y) * GRID_SIZE;
        card_list.push({
            xOffset,
            yOffset,
            id,
            card,
        });
    }

    return (
        <>
            <div className="relative">
                {card_list
                    .filter((c) => c.id !== id)
                    .map((c) => {
                        return (
                            <div
                                key={c.id}
                                className="absolute"
                                style={{
                                    transform: `translate(${c.xOffset}px,${c.yOffset}px)`,
                                }}
                            >
                                <SingleCard
                                    rotation={rotation}
                                    card={c.card}
                                    faceup={c.card.state.revealed?.includes(
                                        player_name
                                    )}
                                />
                            </div>
                        );
                    })}
            </div>
            {main_card_comp}
        </>
    );
}
