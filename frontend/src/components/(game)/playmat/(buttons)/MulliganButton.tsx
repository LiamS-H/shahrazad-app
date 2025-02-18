import { Button } from "@/components/(ui)/button";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { usePlayer } from "@/contexts/(game)/player";
import { randomU64 } from "@/lib/utils/random";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { ListRestart } from "lucide-react";

export function MulliganButton() {
    const { applyAction } = useShahrazadGameContext();
    const { player: player_id } = usePlayer();
    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => {
                applyAction({
                    type: ShahrazadActionCase.Mulligan,
                    player_id,
                    seed: randomU64(),
                });
            }}
        >
            <ListRestart />
        </Button>
    );
}
