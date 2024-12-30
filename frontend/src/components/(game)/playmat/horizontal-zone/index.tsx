import { useShahrazadGameContext } from "../../../../contexts/game";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import {
    horizontalListSortingStrategy,
    SortableContext,
} from "@dnd-kit/sortable";
import SortableCard from "./sortable";
import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { IDroppableData } from "@/types/interfaces/dnd";

export default function HorizontalZone(props: { id: ShahrazadZoneId }) {
    const { getZone } = useShahrazadGameContext();
    const zone = getZone(props.id);
    // const items = zone.cards.length ? zone.cards : ["placeholder"];
    const items = [...zone.cards];
    const data: IDroppableData = { sortable: true };

    const { setNodeRef } = useDroppable({ id: props.id, data });

    // if (true) {
    // if (zone.cards.length == 0) {
    //     return (
    //         <div
    //             className="horizontal-zone"
    //             ref={setNodeRef}
    //             style={{
    //                 width: "100%",
    //                 height: "100%",
    //                 display: "flex",
    //                 flexFlow: "row nowrap",
    //             }}
    //         ></div>
    //     );
    // }

    return (
        <SortableContext
            id={props.id}
            items={items}
            strategy={horizontalListSortingStrategy}
        >
            <div
                ref={setNodeRef}
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexFlow: "row nowrap",
                }}
            >
                {zone.cards.map((id, idx) => (
                    <SortableCard id={id} key={id} index={idx} />
                ))}
            </div>
        </SortableContext>
    );
}
