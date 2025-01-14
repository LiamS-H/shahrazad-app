import { Button } from "@/components/(ui)/button";
import { useShahrazadGameContext } from "@/contexts/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { CornerRightUp } from "lucide-react";

export function UntapButton({ board_id }: { board_id: ShahrazadZoneId }) {
    const { applyAction, getZone } = useShahrazadGameContext();
    const board = getZone(board_id);
    return (
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
    );
}
