import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useShahrazadGameContext } from "../../../../contexts/game";
import { useDroppable } from "@dnd-kit/core";
import HorizontalZone from "../horizontal-zone";

export default function Hand(props: { id: ShahrazadZoneId }) {
    const { getZone } = useShahrazadGameContext();
    const zone = getZone(props.id);

    return (
        <div className="shahrazad-hand">
            <HorizontalZone id={props.id} />
        </div>
    );
}
