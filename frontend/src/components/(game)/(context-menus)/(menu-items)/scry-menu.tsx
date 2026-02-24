import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useScryContext } from "@/contexts/(game)/scry";
import { NumberContextItem } from "./number-item";

export function ScryMenuItem({ zoneId }: { zoneId: ShahrazadZoneId }) {
    const { getZone } = useShahrazadGameContext();
    const { scry } = useScryContext();

    const {
        cards: { length: source_length },
    } = getZone(zoneId);

    return (
        <NumberContextItem
            label="Scry"
            minimum={1}
            maximum={source_length}
            onSubmit={(value) => {
                scry(zoneId, value);
            }}
            disabled={source_length == 0}
        />
    );
}
