import { useZone } from "@/contexts/(game)/game";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import {
    horizontalListSortingStrategy,
    SortableContext,
} from "@dnd-kit/sortable";
import HandCard from "./hand-card";
import { useDroppable } from "@dnd-kit/core";
import { IDroppableData } from "@/types/interfaces/dnd";
import { LayoutGroup, motion } from "framer-motion";
import { useMemo } from "react";

export default function HorizontalZone(props: {
    id: ShahrazadZoneId;
    sortOptions?: true;
}) {
    const zone = useZone(props.id);
    const data: IDroppableData = { sortable: true };
    const { setNodeRef } = useDroppable({ id: props.id, data });

    return useMemo(() => {
        const items = [...zone.cards];
        return (
            <SortableContext
                id={`HZone-${props.id}`}
                items={items}
                strategy={horizontalListSortingStrategy}
            >
                <LayoutGroup>
                    <motion.div
                        animate={true}
                        ref={setNodeRef}
                        className="w-full h-full flex flex-row flex-nowrap overflow-x-auto overflow-y-hidden"
                    >
                        {zone.cards.map((id, idx) => (
                            <HandCard id={id} key={id} index={idx} />
                        ))}
                    </motion.div>
                </LayoutGroup>
            </SortableContext>
        );
    }, [zone, setNodeRef, props.id]);
}
