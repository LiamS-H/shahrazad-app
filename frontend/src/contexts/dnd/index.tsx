import { ReactNode, useCallback, useRef, useState } from "react";
import { IDraggableData, IDroppableData } from "@/types/interfaces/dnd";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

import { useShahrazadGameContext } from "../game";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { DraggableOverlay } from "./overlay";
import { MouseSensor } from "./sensors";
import { ShahrazadActionCase } from "@/types/bindings/action";

export default function ShahrazadDND(props: { children: ReactNode }) {
    const ShahContext = useShahrazadGameContext();
    MouseSensor.ShahContext = ShahContext;
    const shah_ref = useRef(ShahContext);
    shah_ref.current = ShahContext;
    const { applyAction } = ShahContext;
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        console.log("on drag start", event);
        setActiveId(event.active.id.toString());
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        setActiveId(null);

        if (event.over == undefined) {
            console.log("draggable is over nothing");
            return;
        }
        if (!event.active.data.current) {
            console.log("active draggable has no data");
            return;
        }

        if (!("zone" in event.active.data.current)) {
            console.error("active draggable has no zone");
            return;
        }

        const over_data: IDraggableData | IDroppableData = event.over.data
            .current as any;

        const active_data: IDraggableData = event.active.data.current as any;

        if ("zone" in over_data) {
            const index = over_data.index ?? -1;

            if (over_data.zone != active_data.zone) {
                console.log("dropping sortable from outside");
            } else {
                console.log("dropping sortable from within");
            }
            applyAction({
                type: ShahrazadActionCase.CardZone,
                source: active_data.zone,
                destination: over_data.zone,
                index: index,
                cards: [event.active.id.toString()],
                state: { x: undefined, y: undefined },
            });
            return;
        }

        const shah_card = shah_ref.current.getCard(event.active.id.toString());

        const start_zone_id = active_data.zone;
        const end_zone_id = event.over.id.toString();
        const end_zone_gridsize: undefined | number = over_data
            ? over_data.grid
            : undefined;

        const card_height = event.active.rect.current.translated?.height ?? 0;
        const card_width = event.active.rect.current.translated?.width ?? 0;

        let x: undefined | number;
        let y: undefined | number;
        if (end_zone_gridsize) {
            // active.rect.current.initial gets reset to null and this goes back to 0
            // let start_x = shah_card.x
            //     ? shah_card.x * end_zone_gridsize
            //     : undefined;
            // if (start_x === undefined) {
            //     console.log(
            //         "shah card had no start position, trying:",
            //         event.active.rect.current.initial,
            //     );
            // }
            // start_x ??= event.active.rect.current.initial?.left;
            // if (start_x === undefined) {
            //     console.log("shah card had no initial rect");
            // }
            // let start_y = shah_card.y
            //     ? shah_card.y * end_zone_gridsize
            //     : undefined;
            // start_y ??= event.active.rect.current.initial?.top;

            // if (!start_x || !start_y) {
            //     x = event.active.rect.current.translated?.left || 0;
            //     y = event.active.rect.current.translated?.bottom || 0;
            // } else {
            //     x = start_x + event.delta.x;
            //     y = start_y + event.delta.y;
            // }
            x = event.active.rect.current.translated?.left || 0;
            y = event.active.rect.current.translated?.top || 0;

            if (y > event.over.rect.bottom - card_height) {
                y = event.over.rect.bottom - card_height;
            }
            if (y < event.over.rect.top) {
                y = event.over.rect.top;
            }
            if (x > event.over.rect.right - card_width) {
                x = event.over.rect.right - card_width;
            }
            if (x < event.over.rect.left) {
                x = event.over.rect.left;
            }
            x -= event.over.rect.left;
            y -= event.over.rect.top;
            x = Math.max(Math.round(x / end_zone_gridsize), 0);

            y = Math.max(Math.round(y / end_zone_gridsize), 0);
        }
        if (start_zone_id == end_zone_id) {
            console.log("dragging to same draggable");
            applyAction({
                type: ShahrazadActionCase.CardState,
                cards: [event.active.id.toString()],
                state: { x, y },
            });
        }

        const target_id = event.active.id.toString();
        if (start_zone_id != end_zone_id) {
            console.log("dragging between zones");
            console.log(
                `dragging ${target_id} from ${start_zone_id} to ${end_zone_id}`
            );
            applyAction({
                type: ShahrazadActionCase.CardZone,
                cards: [event.active.id.toString()],
                destination: end_zone_id,
                source: start_zone_id,
                state: { x, y, face_down: false },
                index: -1,
            });
        }
    }, []);

    const sensors = useSensors(
        // useSensor(MouseSensor),
        // useSensor(LibMouseSensor),
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            modifiers={[restrictToWindowEdges]}
            // collisionDetection={closestCorners}
            // collisionDetection={pointerWithin}
        >
            {props.children}
            <DragOverlay>
                {activeId ? <DraggableOverlay id={activeId} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
