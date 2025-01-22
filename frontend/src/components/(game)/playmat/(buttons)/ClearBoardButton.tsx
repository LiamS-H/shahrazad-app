import { Button } from "@/components/(ui)/button";
import { useShahrazadGameContext } from "@/contexts/game";
import { usePlayer } from "@/contexts/player";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { X } from "lucide-react";

export function ClearBoardButton() {
    const { applyAction } = useShahrazadGameContext();
    const { player: player_id } = usePlayer();
    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => {
                applyAction({
                    type: ShahrazadActionCase.ClearBoard,
                    player_id,
                });
            }}
        >
            <X />
        </Button>
    );
}
