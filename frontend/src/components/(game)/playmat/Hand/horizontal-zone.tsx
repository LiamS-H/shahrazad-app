import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import {
    horizontalListSortingStrategy,
    SortableContext,
} from "@dnd-kit/sortable";
import HandCard from "./hand-card";
import { useDroppable } from "@dnd-kit/core";
import { IDroppableData } from "@/types/interfaces/dnd";
import { LayoutGroup } from "framer-motion";

export default function HorizontalZone(props: {
    id: ShahrazadZoneId;
    sortOptions?: true;
}) {
    const { getZone } = useShahrazadGameContext();
    const zone = getZone(props.id);
    const items = [...zone.cards];
    const data: IDroppableData = { sortable: true };

    const { setNodeRef } = useDroppable({ id: props.id, data });

    return (
        <SortableContext
            id={props.id}
            items={items}
            strategy={horizontalListSortingStrategy}
        >
            <div
                ref={setNodeRef}
                className="w-full h-full flex flex-row flex-nowrap overflow-x-auto"
            >
                <LayoutGroup>
                    {zone.cards.map((id, idx) => (
                        <HandCard id={id} key={id} index={idx} />
                    ))}
                </LayoutGroup>
            </div>
        </SortableContext>
    );
}
