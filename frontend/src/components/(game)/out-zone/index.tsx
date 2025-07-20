import { useCallback, useMemo, useRef, useState } from "react";
import { useZone } from "@/contexts/(game)/game";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import {
    DndContext,
    DragEndEvent,
    useDraggable,
    useDroppable,
} from "@dnd-kit/core";
import CardStack from "../card-stack";
import { IDroppableData } from "@/types/interfaces/dnd";
import CollapsableCard from "./collapsable";
import { ShahrazadCardId } from "@/types/bindings/card";
import { Button } from "@/components/(ui)/button";
import { Grip, X } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";

function DraggableWrapper(props: {
    id: string;
    children: React.ReactNode;
    pos: {
        x: number;
        y: number;
    };
}) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: props.id,
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Translate.toString(transform),
                left: props.pos.x,
                top: props.pos.y,
            }}
            className="fixed group text-highlight bg-background border rounded-lg shadow-lg flex flex-col z-50"
        >
            <div
                {...listeners}
                {...attributes}
                className="p-1 cursor-grab self-end"
            >
                <Grip />
            </div>
            {props.children}
        </div>
    );
}

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

    const onDragEnd = useCallback((event: DragEndEvent) => {
        const { delta } = event;
        setPos(({ x, y }) => ({
            x: x + delta.x,
            y: y + delta.y,
        }));
    }, []);

    return (
        <DndContext onDragEnd={onDragEnd}>
            <DraggableWrapper id={`draggable-zone-${props.id}`} pos={pos}>
                <div className="flex justify-between items-center p-2 border-b">
                    <h3 className="font-bold select-none">
                        {props.name} ({zone.cards.length})
                    </h3>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={props.onClose}
                        className="h-7 w-7"
                    >
                        <X className="h-4 w-4" />
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
                    <PoppedOutZoneContent
                        id={props.id}
                        emptyMessage={props.name}
                    />
                </div>
            </DraggableWrapper>
        </DndContext>
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
            <div style={{ width: "100px" }} ref={(ref) => setNodeRef(ref)}>
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
        [hoveredItem, props.emptyMessage, setHover, setNodeRef, zone.cards]
    );
}

export default PoppedOutZone;
