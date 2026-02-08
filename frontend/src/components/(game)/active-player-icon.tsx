import { Button } from "@/components/(ui)/button";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import type { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import { DoorOpen, Home, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/components/(ui)/user-profile";

export function ActivePlayerIcon({
    player_id,
    is_host,
}: {
    player_id: ShahrazadPlaymatId;
    is_host: boolean;
}) {
    const { applyAction } = useShahrazadGameContext();
    const { push: pushRoute } = useRouter();

    return (
        <UserProfile
            onChange={(player) =>
                applyAction({
                    type: ShahrazadActionCase.SetPlayer,
                    player_id,
                    player,
                })
            }
        >
            <Button
                onClick={() => {
                    const player = document.getElementById(
                        `player-${player_id}`,
                    );
                    if (!player) {
                        console.error(
                            "[player-icon] unable to locate player to scroll to.",
                        );
                        return;
                    }
                    player.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }}
            >
                My Board
                <Home />
            </Button>
            <Button
                variant="destructive"
                onClick={() => {
                    if (is_host) {
                        applyAction({
                            type: ShahrazadActionCase.GameTerminated,
                        });
                    } else {
                        applyAction({
                            type: ShahrazadActionCase.SetPlayer,
                            player_id,
                        });
                        localStorage.setItem("saved-player-id", "");
                        pushRoute("/");
                    }
                }}
            >
                {is_host ? (
                    <>
                        Close Game
                        <Trash2 />
                    </>
                ) : (
                    <>
                        Leave
                        <DoorOpen />
                    </>
                )}
            </Button>
        </UserProfile>
    );
}
