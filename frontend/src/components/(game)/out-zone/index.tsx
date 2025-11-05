import { useCallback, useMemo, useRef, useState } from "react";
import { useZone } from "@/contexts/(game)/game";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useDroppable } from "@dnd-kit/core";
import { IDroppableData } from "@/types/interfaces/dnd";
import CollapsableCard from "./collapsable";
import { ShahrazadCardId } from "@/types/bindings/card";
import { Button } from "@/components/(ui)/button";
import { Grip, X } from "lucide-react";

function PoppedOutZone(props: {
    id: ShahrazadZoneId;
    name: string;
    onClose: () => void;
    pos: {
        x: number;
        y: number;
    };
}) {
    const [pos, setPos] = useState(props.pos);
    const [height, setHeight] = useState(400);
    const zone = useZone(props.id);

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
            };

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        },
        [pos.x, pos.y]
    );

    return (
        <div
            style={{
                left: pos.x,
                top: pos.y,
            }}
            className="fixed group text-highlight bg-background border rounded-lg shadow-lg flex flex-col z-50"
        >
            <div className="flex justify-between items-center p-1 border-b">
                <div className="flex items-center gap-1">
                    <Button
                        className="cursor-grab "
                        size="icon"
                        variant="ghost"
                        onMouseDown={handleMouseDown}
                    >
                        <Grip />
                    </Button>
                    <h3 className="font-bold select-none">
                        {props.name} ({zone.cards.length})
                    </h3>
                </div>
                <Button size="icon" variant="ghost" onClick={props.onClose}>
                    <X />
                </Button>
            </div>
            <div
                style={{
                    width: `250px`,
                    height: `${height}px`,
                    overflowY: "auto",
                    resize: "vertical",
                }}
                className="p-2"
                onMouseDown={(e) => e.stopPropagation()} // Prevent dragging from starting when resizing
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
        null
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
        [setHoveredItem, hoveredItem]
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
                            <CollapsableCard
                                id={id}
                                isBottom={isBottom}
                                isHovered={isHovered}
                                setHovered={setHover}
                                key={id}
                            />
                        );
                    })}
                </div>
            </div>
        ),
        [hoveredItem, setHover, setNodeRef, zone.cards]
    );
}

export default PoppedOutZone;
