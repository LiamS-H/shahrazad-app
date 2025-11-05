import { ReactNode, useCallback, useRef, useState } from "react";
import { IDraggableData, IDroppableData } from "@/types/interfaces/dnd";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    // KeyboardSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

import { useShahrazadGameContext } from "../game";
// import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { DraggableOverlay } from "../../../components/(game)/card-overlay/overlay";
import { MouseSensor } from "./sensors";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { useSelection } from "../selection";
import { DraggingContextProvider } from "./dragging";
import { ZoneName } from "@/types/bindings/zone";

export default function ShahrazadDND(props: { children: ReactNode }) {
    const ShahContext = useShahrazadGameContext();
    const shah_ref = useRef(ShahContext);
    shah_ref.current = ShahContext;
    MouseSensor.ShahContext = ShahContext;

    const SelectionContext = useSelection();
    MouseSensor.SelectedContext = SelectionContext;
    const selection_ref = useRef(SelectionContext);
    selection_ref.current = SelectionContext;

    const [activeId, setActiveId] = useState<string | null>(null);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id.toString());
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        setActiveId(null);
        const { selectedCards, selectCards } = selection_ref.current;
        const { getCard, getZone, applyAction, active_player } =
            shah_ref.current;

        if (event.over == undefined) {
            console.log("[dnd] draggable is over nothing");
            return;
        }
        if (!event.active.data.current) {
            console.log("[dnd] active draggable has no data");
            return;
        }

        if (!("zone" in event.active.data.current)) {
            console.error("[dnd] active draggable has no zone");
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

        const shah_card = getCard(target_id);

        if (over_data && "zone" in over_data) {
            const index = over_data.index ?? -1;
            const {
                state: { face_down, tapped, flipped, inverted, revealed },
            } = shah_card;

            if (over_data.zone !== active_data.zone) {
                console.log("[dnd] dropping sortable from outside");
                if (
                    getZone(active_data.zone).name === ZoneName.LIBRARY &&
                    getZone(over_data.zone).name === ZoneName.HAND
                ) {
                    applyAction({
                        type: ShahrazadActionCase.CardZone,
                        destination: over_data.zone,
                        index: index,
                        cards: cards,
                        state: {
                            x: 255,
                            y: 255,
                            revealed: face_down ? [active_player] : [],
                        },
                    });
                    return;
                }
                applyAction({
                    type: ShahrazadActionCase.CardZone,
                    destination: over_data.zone,
                    index: index,
                    cards: cards,
                    state: {
                        x: 255,
                        y: 255,
                        face_down: face_down === true ? false : undefined,
                        tapped: tapped === true ? false : undefined,
                        flipped: flipped === true ? false : undefined,
                        inverted: inverted === true ? false : undefined,
                        revealed: revealed?.length !== 0 ? [] : undefined,
                    },
                });
                selectCards(null);
            } else {
                console.log("[dnd] dropping sortable from within");
                applyAction({
                    type: ShahrazadActionCase.CardZone,
                    destination: over_data.zone,
                    index: index,
                    cards: cards,
                    state: { x: 255, y: 255 },
                });
            }

            return;
        }

        const start_zone_id = active_data.zone;
        const { name: start_zone_name } = getZone(start_zone_id);
        const end_zone_id = event.over.id.toString();
        const end_zone_gridsize: undefined | number = over_data
            ? over_data.grid
            : undefined;
        const { name: end_zone_name } = getZone(end_zone_id);

        const card_height = event.active.rect.current.translated?.height ?? 0;
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
        // x = x === undefined ? 255 : x;
        // y = y === undefined ? 255 : y;
        x ??= 255;
        y ??= 255;
        if (start_zone_id == end_zone_id) {
            console.log("[dnd] dragging to same draggable");
            applyAction({
                type: ShahrazadActionCase.CardState,
                cards: cards,
                state: { x, y },
            });
        }

        if (start_zone_id != end_zone_id) {
            console.log("[dnd] dragging between zones");
            console.log(
                `[dnd] dragging ${target_id} from ${start_zone_id} to ${end_zone_id}`
            );
            const {
                state: {
                    face_down,
                    tapped,
                    flipped,
                    inverted,
                    revealed,
                    counters,
                },
            } = shah_card;

            if (
                start_zone_name === ZoneName.HAND &&
                end_zone_name === ZoneName.LIBRARY
            ) {
                applyAction({
                    type: ShahrazadActionCase.CardZone,
                    cards,
                    destination: end_zone_id,
                    state: {
                        x,
                        y,
                    },
                    index: -1,
                });
            } else {
                applyAction({
                    type: ShahrazadActionCase.CardZone,
                    cards,
                    destination: end_zone_id,
                    state: {
                        x,
                        y,
                        face_down: face_down === true ? false : undefined,
                        tapped: tapped === true ? false : undefined,
                        flipped:
                            x === 255 && flipped === true ? false : undefined,
                        inverted:
                            x === 255 && inverted === true ? false : undefined,
                        revealed: revealed?.length !== 0 ? [] : undefined,
                        counters:
                            over_data?.sortable && counters?.length !== 0
                                ? []
                                : undefined,
                    },
                    index: -1,
                });
            }
            // const reset = !(
            //     start_zone_name === ZoneName.HAND &&
            //     end_zone_name === ZoneName.LIBRARY
            // );

            if (x === 255) {
                selectCards(null);
            }
        }
    }, []);

    const sensors = useSensors(
        // useSensor(MouseSensor),
        // useSensor(LibMouseSensor),
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } })
        // useSensor(KeyboardSensor, {
        //     coordinateGetter: sortableKeyboardCoordinates,
        // })
    );

    const { selectedCards } = SelectionContext;

    const dragging = activeId
        ? selectedCards.includes(activeId)
            ? [activeId, ...selectedCards.filter((id) => id !== activeId)]
            : [activeId]
        : null;

    return (
        <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            modifiers={[restrictToWindowEdges]}
            // collisionDetection={closestCorners}
            // collisionDetection={pointerWithin}
        >
            <DraggingContextProvider dragging={dragging}>
                {props.children}
            </DraggingContextProvider>
            <DragOverlay>
                {activeId ? <DraggableOverlay id={activeId} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
