import { Button } from "@/components/(ui)/button";
import { useShahrazadGameContext, useZone } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { CornerRightUp } from "lucide-react";
import { useMemo } from "react";

export function UntapButton({ board_id }: { board_id: ShahrazadZoneId }) {
    const { applyAction } = useShahrazadGameContext();
    const board = useZone(board_id);
    return useMemo(
        () => (
            <Button
                variant="outline"
                size="icon"
                onClick={() => {
                    applyAction({
                        type: ShahrazadActionCase.CardState,
                        cards: board.cards,
                        state: { tapped: false },
                    });
                }}
            >
                <CornerRightUp />
            </Button>
        ),
        [board, applyAction]
    );
}
