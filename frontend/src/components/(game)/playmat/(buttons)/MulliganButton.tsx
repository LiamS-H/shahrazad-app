import { Button } from "@/components/(ui)/button";
import { useShahrazadGameContext } from "@/contexts/game";
import { usePlayer } from "@/contexts/player";
import { randomU64 } from "@/lib/random";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { ListRestart } from "lucide-react";

export function MulliganButton() {
    const { applyAction } = useShahrazadGameContext();
    const player_id = usePlayer();
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
