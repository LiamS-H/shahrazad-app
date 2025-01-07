import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useShahrazadGameContext } from "../../../../contexts/game";
import HorizontalZone from "../horizontal-zone";
import { Scrycard } from "react-scrycards";

export default function Hand(props: { id: ShahrazadZoneId; active: boolean }) {
    const { getZone } = useShahrazadGameContext();
    const zone = getZone(props.id);

    if (!props.active) {
        return (
            <div className="shahrazad-hand flex-grow flex">
                {zone.cards.map((c) => (
                    <Scrycard key={c} card={null} faceDown />
                ))}
            </div>
        );
    }

    return (
        <div className="shahrazad-hand">
            <HorizontalZone id={props.id} />
        </div>
    );
}
