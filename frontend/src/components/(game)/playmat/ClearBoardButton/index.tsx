import { Button } from "@/components/ui/button";
import { useShahrazadGameContext } from "@/contexts/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import { X } from "lucide-react";

export default function ClearBoardButton({
    playerId,
}: {
    playerId: ShahrazadPlaymatId;
}) {
    const { applyAction } = useShahrazadGameContext();
    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => {
                applyAction({
                    type: ShahrazadActionCase.ClearBoard,
                    player_id: playerId,
                });
            }}
        >
            <X />
        </Button>
    );
}
