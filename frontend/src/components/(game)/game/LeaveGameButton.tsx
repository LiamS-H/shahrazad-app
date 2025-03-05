import { Button } from "@/components/(ui)/button";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { DoorOpen, UserMinus } from "lucide-react";

export function LeaveGame({
    player,
    active,
}: {
    player: string;
    active: boolean;
}) {
    const { applyAction } = useShahrazadGameContext();

    const icon = active ? <DoorOpen /> : <UserMinus />;

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => {
                applyAction({
                    type: ShahrazadActionCase.SetPlayer,
                    player_id: player,
                });
            }}
        >
            {icon}
        </Button>
    );
}
