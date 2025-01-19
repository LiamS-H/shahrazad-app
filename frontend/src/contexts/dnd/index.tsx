import { ReactNode, useCallback, useState } from "react";
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
import { DraggableOverlay } from "../../components/(game)/card-overlay/overlay";
import { MouseSensor } from "./sensors";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { useSelection } from "../selection";

export default function ShahrazadDND(props: { children: ReactNode }) {
    const ShahContext = useShahrazadGameContext();
    MouseSensor.ShahContext = ShahContext;
    const { applyAction } = ShahContext;
    const SelectionContext = useSelection();
    MouseSensor.SelectedContext = SelectionContext;
    const { selectedCards, selectCards } = SelectionContext;
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id.toString());
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
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

            const over_data = event.over.data.current as
                | IDraggableData
                | IDroppableData
                | undefined;

            const active_data = event.active.data.current as IDraggableData;
            const target_id = event.active.id.toString();
            const cards = selectedCards.includes(target_id)
                ? [target_id, ...selectedCards.filter((id) => id !== target_id)]
                : [target_id];

            if (over_data && "zone" in over_data) {
                const index = over_data.index ?? -1;

                if (over_data.zone != active_data.zone) {
                    console.log("dropping sortable from outside");
                    applyAction({
                        type: ShahrazadActionCase.CardZone,
                        source: active_data.zone,
                        destination: over_data.zone,
                        index: index,
                        cards: cards,
                        state: { x: 255, y: 255 },
                    });
                } else {
                    console.log("dropping sortable from within");
                    applyAction({
                        type: ShahrazadActionCase.CardZone,
                        source: active_data.zone,
                        destination: over_data.zone,
                        index: index,
                        cards: [target_id],
                        state: { x: 255, y: 255 },
                    });
                }

                return;
            }

            // const shah_card = shah_ref.current.getCard(target_id);

            const start_zone_id = active_data.zone;
            const end_zone_id = event.over.id.toString();
            const end_zone_gridsize: undefined | number = over_data
                ? over_data.grid
                : undefined;

            const card_height =
                event.active.rect.current.translated?.height ?? 0;
            const card_width = event.active.rect.current.translated?.width ?? 0;

            let x: undefined | number;
            let y: undefined | number;
            if (end_zone_gridsize) {
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
            x = x === undefined ? 255 : x;
            y = y === undefined ? 255 : y;
            if (start_zone_id == end_zone_id) {
                console.log("dragging to same draggable");
                applyAction({
                    type: ShahrazadActionCase.CardState,
                    cards: cards,
                    state: { x, y },
                });
            }

            if (start_zone_id != end_zone_id) {
                console.log("dragging between zones");
                console.log(
                    `dragging ${target_id} from ${start_zone_id} to ${end_zone_id}`
                );

                applyAction({
                    type: ShahrazadActionCase.CardZone,
                    cards,
                    destination: end_zone_id,
                    source: start_zone_id,
                    state: {
                        x,
                        y,
                        face_down: false,
                        tapped: false,
                        flipped: x === 255 ? false : undefined,
                        inverted: x === 255 ? false : undefined,
                        revealed: [],
                    },
                    index: -1,
                });
                selectCards(null);
            }
        },
        [applyAction, selectedCards, selectCards]
    );

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
