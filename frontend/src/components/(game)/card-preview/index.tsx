import { Button } from "@/components/(ui)/button";
import { useSelection } from "@/contexts/(game)/selection";
import { ShahrazadCard } from "@/types/bindings/card";
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
            className="fixed group text-highlight z-50"
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
    const [flipped, setFlipped] = useState<boolean>(shah_card.state.flipped);
    useEffect(() => {
        setFlipped(shah_card.state.flipped);
    }, [shah_card]);
    console.log("flipped", flipped);

    const scrycard = useScrycard(shah_card.card_name);

    return useMemo(() => {
        if (size === 0) return null;
        console.log("rendering", flipped);
        return (
            <div className="relative">
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
    }, [shah_card.card_name, shah_card.state.flipped, flipped, size, scrycard]);
}

export function PreviewCard() {
    const { getCard } = useShahrazadGameContext();
    const [pos, setPos] = useState({ x: 1170, y: 80 });
    const [size, setSize] = useState<number>(400);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const { currentPreview: id } = useSelection();

    const clampPosition = useCallback(
        (p: { x: number; y: number }) => {
            if (windowSize.width === 0) {
                return p;
            }

            const cardHeight = size * 1.393;
            const buttonOffset = 16;

            const minX = buttonOffset;
            const minY = buttonOffset;
            const maxX = windowSize.width - Math.max(size, 120);
            const maxY = windowSize.height - cardHeight;

            return {
                x: Math.max(minX, Math.min(p.x, maxX)),
                y: Math.max(minY, Math.min(p.y, maxY)),
            };
        },
        [size, windowSize.width, windowSize.height],
    );

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        setPos(clampPosition);
    }, [clampPosition]);

    const { currentPreview, setPreview } = useSelection();

    const shah_card = useMemo(() => {
        if (!id) return null;
        return getCard(id);
    }, [getCard, id]);

    const onDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { delta } = event;
            setPos(({ x, y }) =>
                clampPosition({
                    x: x + delta.x,
                    y: y + delta.y,
                }),
            );
        },
        [clampPosition],
    );

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
