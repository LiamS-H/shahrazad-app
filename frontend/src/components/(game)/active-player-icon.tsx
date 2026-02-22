import { Button } from "@/components/(ui)/button";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import type { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import { DoorOpen, Home, Settings, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/components/(ui)/user-profile";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/(ui)/dialog";
import { GameSettings } from "./game-settings";
import { useState } from "react";

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
            {is_host && <SettingsDialog />}
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

function SettingsDialog() {
    const { applyAction, settings } = useShahrazadGameContext();
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    Settings <Settings />
                </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col gap-4">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription className="flex flex-col">
                        <span>Change game settings.</span>
                    </DialogDescription>
                </DialogHeader>
                <GameSettings
                    initialSettings={{
                        ...settings,
                        starting_life: settings.starting_life.toString(),
                        custom_starting_life:
                            localStorage.getItem("default-game-customLife") ??
                            "25",
                    }}
                    onSubmit={(settings) => {
                        applyAction({
                            type: ShahrazadActionCase.SetSettings,
                            settings: { ...settings },
                        });
                        setOpen(false);
                    }}
                    submitButtonText="Save Settings"
                />
            </DialogContent>
        </Dialog>
    );
}
