import { Button } from "@/components/(ui)/button";
import { useSelection } from "@/contexts/(game)/selection";
import { ShahrazadCard, ShahrazadCardId } from "@/types/bindings/card";
import { DndContext, DragEndEvent, useDraggable } from "@dnd-kit/core";
import { Eye, EyeOff, FlipHorizontal, Grip, Scaling } from "lucide-react";
import {
    type HTMLProps,
    type ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { isFlippable, ScryNameCard, useScrycard } from "react-scrycards";
import { CSS } from "@dnd-kit/utilities";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { compareCards } from "@/lib/utils/compare";

function DraggableWrapper({
    children,
    pos: { x, y },
    ...props
}: Omit<HTMLProps<HTMLDivElement>, "style"> & {
    children: ReactNode;
    pos: {
        x: number;
        y: number;
    };
}) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: "preview",
    });

    return (
        <div
            className="fixed group text-highlight"
            ref={setNodeRef}
            style={{
                transform: CSS.Translate.toString(transform),
                left: x,
                top: y,
            }}
            {...props}
        >
            {children}
            <Button
                className="absolute -top-4 -left-4 cursor-grab "
                size="icon"
                variant="outline"
                {...listeners}
                {...attributes}
            >
                <Grip />
            </Button>
        </div>
    );
}

function Card({ shah_card, size }: { shah_card: ShahrazadCard; size: number }) {
    const [flipped, setFlipped] = useState<boolean | null>(null);
    useEffect(() => {
        setFlipped(null);
    }, [shah_card]);

    const scrycard = useScrycard(shah_card.card_name);

    return useMemo(() => {
        if (size === 0) return null;
        return (
            <div className="fixed">
                <ScryNameCard
                    card_name={shah_card.card_name}
                    flipped={
                        flipped === null ? shah_card.state.flipped : flipped
                    }
                    size="xl"
                    width={`${size}px`}
                    animated
                />
                {isFlippable(scrycard) && (
                    <div className="absolute -top-4 left-20">
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
            </div>
        );
    }, [shah_card.card_name, shah_card.state.flipped, flipped, size, scrycard]);
}

export default function PreviewCard({ id }: { id: ShahrazadCardId | null }) {
    const { getCard } = useShahrazadGameContext();
    const [pos, setPos] = useState({ x: 1470, y: 80 });
    const [size, setSize] = useState<number>(400);

    const [shah_card, setCard] = useState<ShahrazadCard | null>(null);
    const { currentPreview, setPreview } = useSelection();

    useEffect(() => {
        if (!id) {
            setCard(null);
            return;
        }
        const card = getCard(id);

        setCard((old) => {
            if (!card) return null;
            if (!old) return card;
            if (compareCards(old, card)) return old;
            return card;
        });
    }, [getCard, id]);

    const onDragEnd = useCallback((event: DragEndEvent) => {
        const { delta } = event;
        setPos(({ x, y }) => ({
            x: x + delta.x,
            y: y + delta.y,
        }));
    }, []);

    const card = useMemo(() => {
        if (shah_card) return <Card size={size} shah_card={shah_card} />;
        return (
            <div
                style={{ width: `${size}px` }}
                className="scrycard group-hover:outline-dashed outline-4 outline-secondary bg-transparent"
            />
        );
    }, [shah_card, size]);

    return (
        <DndContext onDragEnd={onDragEnd}>
            <DraggableWrapper
                pos={pos}
                onMouseEnter={() => {
                    setPreview(currentPreview);
                }}
                onMouseLeave={() => {
                    setPreview(null);
                }}
            >
                {card}
                <Button
                    className="absolute -top-4 left-8"
                    size="icon"
                    variant="outline"
                    onClick={() =>
                        setSize((old) => {
                            const size = (old + 100) % 600;
                            return size === 100 ? 200 : size;
                        })
                    }
                >
                    {size === 0 ? (
                        <Eye />
                    ) : size === 500 ? (
                        <EyeOff />
                    ) : (
                        <Scaling />
                    )}
                </Button>
            </DraggableWrapper>
        </DndContext>
    );
}
