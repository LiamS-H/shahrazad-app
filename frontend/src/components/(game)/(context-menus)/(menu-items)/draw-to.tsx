import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadCardStateTransform } from "@/types/bindings/card";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { NumberContextItem } from "./number-item";

export function DrawTo({
    source,
    destination,
    label,
    state,
}: {
    source: ShahrazadZoneId;
    destination: ShahrazadZoneId;
    label: string;
    state?: ShahrazadCardStateTransform;
}) {
    const { applyAction, getZone } = useShahrazadGameContext();

    const {
        cards: { length: source_length },
    } = getZone(source);

    return (
        <NumberContextItem
            label={label}
            minimum={1}
            maximum={source_length}
            onSubmit={(amount) =>
                applyAction({
                    type: ShahrazadActionCase.DrawTop,
                    amount,
                    destination,
                    source,
                    state: state || { face_down: false },
                })
            }
        />
    );
}
