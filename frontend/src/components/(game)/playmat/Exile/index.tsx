import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useShahrazadGameContext } from "@/contexts/game";
import { useDroppable } from "@dnd-kit/core";
import CardStack from "@/components/(game)/card-stack";
import { IDroppableData } from "@/types/interfaces/dnd";

export default function Exile(props: { id: ShahrazadZoneId }) {
    const { getZone } = useShahrazadGameContext();
    const zone = getZone(props.id);
    const data: IDroppableData = {};
    const { setNodeRef } = useDroppable({ id: props.id, data });

    return (
        <div
            className="shahrazad-exile"
            style={{ width: "auto" }}
            ref={(ref) => setNodeRef(ref)}
        >
            {<CardStack emptyMessage="exile" cards={zone.cards} />}
        </div>
    );
}
