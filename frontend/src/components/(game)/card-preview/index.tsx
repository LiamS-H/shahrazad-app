import { Button } from "@/components/(ui)/button";
import { useSelection } from "@/contexts/(game)/selection";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { Expand, ExternalLink, EyeOff, ScanEye, Shrink } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { DraggableWrapper } from "./draggable-wrapper";
import { Card } from "./card";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useScrycard } from "react-scrycards";

export function PreviewCard({
    hidden,
    onHide,
}: {
    hidden?: boolean;
    onHide?: () => void;
}) {
    const { getCard } = useShahrazadGameContext();
    const [pos, setPos] = useState({ x: window.innerWidth - 300, y: 80 });
    const [size, setSize] = useState<number>(300);
    const { currentPreview: id } = useSelection();
    const { currentPreview, setPreview } = useSelection();

    const eleRef = useRef<HTMLDivElement | null>(null);

    const shah_card = useMemo(() => {
        if (!id) return null;
        return getCard(id);
    }, [getCard, id]);

    const scry_card = useScrycard(shah_card?.card_name ?? "");

    const onDragEnd = useCallback((event: DragEndEvent) => {
        const { delta } = event;
        setPos(({ x, y }) => ({
            x: x + delta.x,
            y: y + delta.y,
        }));
    }, []);

    const clampPosition = useCallback(
        (p: { x: number; y: number }, size?: number) => {
            if (window.innerWidth === 0) {
                return p;
            }
            const rect = eleRef.current?.getBoundingClientRect();
            if (!rect) {
                return p;
            }

            const { width, height } = rect;

            const zoneWidth = size ? size : width;
            const zoneHeight = size ? size * 1.4 : height;

            const minX = 0;
            const minY = 0;
            const maxX = window.innerWidth - zoneWidth;
            const maxY = window.innerHeight - zoneHeight;

            return {
                x: Math.max(minX, Math.min(p.x, maxX)),
                y: Math.max(minY, Math.min(p.y, maxY)),
            };
        },
        [eleRef],
    );

    useEffect(() => {
        const handleResize = () => {
            setPos(clampPosition);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [clampPosition]);

    const card = useMemo(() => {
        if (shah_card) return <Card size={size} shah_card={shah_card} />;
        return (
            <div
                style={{ width: `${size}px`, background: "transparent" }}
                className="scrycard group-hover:outline-dashed group-hover:outline-4 outline-secondary"
            />
        );
    }, [shah_card, size]);

    if (hidden) return null;

    return (
        <DndContext onDragEnd={onDragEnd} modifiers={[restrictToWindowEdges]}>
            <DraggableWrapper
                pos={pos}
                onMouseEnter={() => {
                    setPreview(currentPreview);
                }}
                onMouseLeave={() => {
                    setPreview(null);
                }}
                ref={eleRef}
                className={shah_card ? "z-60" : "z-40"}
            >
                {card}
                <Button
                    className="absolute top-8 -left-4 opacity-0 group-hover:opacity-100 text-foreground"
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                        let new_size = (size + 100) % 600;
                        new_size = new_size === 0 ? 200 : new_size;
                        setSize(new_size);
                        setPos((p) => clampPosition(p, new_size + 32));
                    }}
                >
                    {size === 500 ? <Shrink /> : <Expand />}
                </Button>
                {onHide && (
                    <Button
                        className="absolute top-20 -left-4 opacity-0 group-hover:opacity-100 text-foreground"
                        size="icon"
                        variant="ghost"
                        onClick={onHide}
                    >
                        <EyeOff />
                    </Button>
                )}
                {scry_card?.id && (
                    <Button
                        className="absolute top-32 -left-4 opacity-0 group-hover:opacity-100 text-foreground"
                        size="icon"
                        variant="ghost"
                        asChild
                    >
                        <a
                            target="_blank"
                            href={`https://cconfluence.vercel.app/?card=${scry_card.id}`}
                        >
                            <ExternalLink />
                        </a>
                    </Button>
                )}
            </DraggableWrapper>
        </DndContext>
    );
}

export function PreviewCardButton() {
    const [open, setOpen] = useState(true);
    return (
        <>
            <Button
                variant="outline"
                size="icon"
                onClick={() => setOpen((o) => !o)}
                className={`relative`}
            >
                {open ? <EyeOff /> : <ScanEye />}
            </Button>
            <PreviewCard hidden={!open} onHide={() => setOpen(false)} />
        </>
    );
}
