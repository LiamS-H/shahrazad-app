import { useMemo, useState } from "react";
import { useShahrazadGameContext } from "@/contexts/game";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useDroppable } from "@dnd-kit/core";
import CardStack from "../card-stack";
import { IDroppableData } from "@/types/interfaces/dnd";
import CollapsableCard from "./collapsable";

export default function VerticalZone(props: {
    id: ShahrazadZoneId;
    hidden?: boolean;
    emptyMessage: string;
}) {
    const { getZone } = useShahrazadGameContext();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const setHover = useMemo(() => setHoveredItem, []);

    const zone = getZone(props.id);
    const data: IDroppableData = {};
    const { setNodeRef } = useDroppable({ id: props.id, data });

    return (
        <div style={{ width: "100px" }} ref={(ref) => setNodeRef(ref)}>
            {props.hidden ? (
                <CardStack
                    emptyMessage={props.emptyMessage}
                    cards={zone.cards}
                />
            ) : (
                <>
                    <CardStack emptyMessage={props.emptyMessage} cards={[]} />
                    <div
                        style={{
                            display: "flex",
                            position: "absolute",
                            bottom: 0,
                            flexFlow: "column nowrap",
                            transform: "translateY(-125px)",
                        }}
                    >
                        {zone.cards.map((id, index) => {
                            const isHovered = id == hoveredItem;
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
                </>
            )}
        </div>
    );
}
