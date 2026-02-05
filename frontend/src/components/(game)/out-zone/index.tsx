import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useZone } from "@/contexts/(game)/game";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useDroppable } from "@dnd-kit/core";
import { IDroppableData } from "@/types/interfaces/dnd";
import { Collapsable } from "./collapsable";
import { ShahrazadCardId } from "@/types/bindings/card";
import { Button } from "@/components/(ui)/button";
import { Grip, X } from "lucide-react";

export function PoppedOutZone(props: {
    id: ShahrazadZoneId;
    name: string;
    onClose?: () => void;
    pos: {
        x: number;
        y: number;
    };
}) {
    const [pos, setPos] = useState(props.pos);
    const [height, setHeight] = useState(400);
    const zone = useZone(props.id);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

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

    const clampPosition = useCallback(
        (p: { x: number; y: number }) => {
            if (windowSize.width === 0) {
                return p;
            }

            const zoneWidth = 260;
            const zoneHeight = height + 50;

            const minX = 16;
            const minY = 16;
            const maxX = windowSize.width - zoneWidth;
            const maxY = windowSize.height - zoneHeight;

            return {
                x: Math.max(minX, Math.min(p.x, maxX)),
                y: Math.max(minY, Math.min(p.y, maxY)),
            };
        },
        [height, windowSize],
    );

    useEffect(() => {
        setPos(clampPosition);
    }, [clampPosition]);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            const startPos = { x: e.clientX, y: e.clientY };
            const startZonePos = { x: pos.x, y: pos.y };

            const handleMouseMove = (e: MouseEvent) => {
                const dx = e.clientX - startPos.x;
                const dy = e.clientY - startPos.y;
                setPos({ x: startZonePos.x + dx, y: startZonePos.y + dy });
            };

            const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
                setPos((p) => clampPosition(p));
            };

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        },
        [pos.x, pos.y, clampPosition],
    );

    return (
        <div
            style={{
                left: pos.x,
                top: pos.y,
            }}
            className="fixed group text-highlight bg-background border rounded-lg shadow-lg flex flex-col z-40"
        >
            <div
                className="flex justify-between items-center p-1 border-b"
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-1">
                    <Button
                        className="cursor-grab "
                        size="icon"
                        variant="ghost"
                    >
                        <Grip />
                    </Button>
                    <h3 className="font-bold select-none">
                        {props.name} ({zone.cards.length})
                    </h3>
                </div>
                {props.onClose && (
                    <Button size="icon" variant="ghost" onClick={props.onClose}>
                        <X />
                    </Button>
                )}
            </div>
            <div
                style={{
                    width: `250px`,
                    height: `${height}px`,
                    overflowY: "auto",
                    resize: "vertical",
                }}
                className="p-2"
                onChange={(e) =>
                    setHeight(parseInt(e.currentTarget.style.height))
                }
            >
                <PoppedOutZoneContent id={props.id} emptyMessage={props.name} />
            </div>
        </div>
    );
}

function PoppedOutZoneContent(props: {
    id: ShahrazadZoneId;
    emptyMessage: string;
}) {
    const [hoveredItem, setHoveredItem] = useState<ShahrazadCardId | null>(
        null,
    );
    const hover_timeout = useRef<NodeJS.Timeout | null>(null);

    const setHover = useCallback(
        (id: ShahrazadCardId | null) => {
            if (hoveredItem === null) {
                setHoveredItem(id);
                return;
            }
            if (hover_timeout.current) {
                clearTimeout(hover_timeout.current);
            }
            hover_timeout.current = setTimeout(() => {
                setHoveredItem(id);
            }, 100);
        },
        [setHoveredItem, hoveredItem],
    );

    const zone = useZone(props.id);
    const data: IDroppableData = {};
    const { setNodeRef } = useDroppable({ id: props.id, data });

    return useMemo(
        () => (
            <div className="w-full h-full" ref={(ref) => setNodeRef(ref)}>
                <div
                    style={{
                        display: "flex",
                        flexFlow: "column nowrap",
                    }}
                >
                    {zone.cards.map((id, index) => {
                        const isHovered = id === hoveredItem;
                        const isBottom = index === zone.cards.length - 1;
                        return (
                            <Collapsable
                                id={id}
                                isBottom={isBottom}
                                isHovered={isHovered}
                                setHovered={setHover}
                                key={`${props.emptyMessage}-${id}`}
                            />
                        );
                    })}
                </div>
            </div>
        ),
        [hoveredItem, setHover, setNodeRef, zone.cards, props.emptyMessage],
    );
}
