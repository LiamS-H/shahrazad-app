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
    id,
    card,
    faceup,
    selected,
    rotation,
}: {
    id: ShahrazadCardId;
    card: ShahrazadCard;
    faceup?: boolean;
    selected?: number;
    rotation: Rotation;
}) {
    const countComp = selected ? (
        <div className="absolute -top-2 -right-2 w-6 h-6  rounded-full bg-destructive text-destructive-foreground flex justify-center items-center">
            {selected}
        </div>
    ) : null;

    const cardComp = (
        <div
            style={
                card.token
                    ? {
                          outline: "4px solid hsl(var(--token-outline))",
                          borderRadius: "4.75% / 3.5%",
                      }
                    : undefined
            }
            data-shahcard={id}
        >
            <ScryNameCard
                card_name={card.card_name}
                flipped={card.state.flipped}
                faceDown={card.state.face_down && !faceup}
            />
        </div>
    );

    if (!card.state.tapped)
        return (
            <RotationWrapper rotation={rotation}>
                {cardComp}
                {countComp}
            </RotationWrapper>
        );
    return (
        <RotationWrapper rotation={rotation}>
            <div className="relative h-[100px] w-[140px] -translate-x-5 translate-y-5">
                <div className="left-5 -top-5 absolute rotate-90">
                    {cardComp}
                </div>
                {countComp}
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
        [],
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

    if (!main_card) {
        return null;
    }

    const main_card_comp = (
        <div onMouseMove={handleMouseMove} className="absolute cursor-grabbing">
            <SingleCard
                id={id}
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
                                    id={c.id}
                                    rotation={rotation}
                                    card={c.card}
                                    faceup={c.card.state.revealed?.includes(
                                        player_name,
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
