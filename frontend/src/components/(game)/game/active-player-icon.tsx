import { Input } from "@/components/(ui)/input";
import { Button } from "@/components/(ui)/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { loadPlayer, savePlayer } from "@/lib/client/localPlayer";
import { ShahrazadActionCase } from "@/types/bindings/action";
import type {
    ShahrazadPlayer,
    ShahrazadPlaymatId,
} from "@/types/bindings/playmat";
import { DoorOpen, Home, Trash2, User, UserPen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ActivePlayerIcon({
    player_id,
    is_host,
}: {
    player_id: ShahrazadPlaymatId;
    is_host: boolean;
}) {
    const [player, setPlayer] = useState<ShahrazadPlayer | null>(null);
    const [open, setOpen] = useState(false);
    const [nameInput, setNameInput] = useState(player?.display_name || "");
    const { applyAction } = useShahrazadGameContext();
    const { push: pushRoute } = useRouter();

    function updatePlayer(new_player: ShahrazadPlayer | null) {
        if (player?.display_name === new_player?.display_name) return;
        if (new_player === null) return;
        applyAction({
            type: ShahrazadActionCase.SetPlayer,
            player_id,
            player: new_player,
        });
        setPlayer(new_player);
    }

    useEffect(() => {
        const stored = loadPlayer();
        updatePlayer(stored?.player || null);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (player) {
            savePlayer(undefined, player);
        }
    }, [player]);

    return (
        <Popover
            open={open}
            onOpenChange={(open) => {
                if (open) {
                    setNameInput(player?.display_name || "");
                } else {
                    updatePlayer({ ...player, display_name: nameInput });
                }
                setOpen(open);
            }}
        >
            <PopoverTrigger className="text-highlight" asChild>
                {player === null || !player.display_name ? (
                    <Button variant="outline" size="icon">
                        <UserPen />
                    </Button>
                ) : (
                    <Button className="group" variant="outline">
                        <div className="h-full w-4 relative">
                            <User
                                className={`absolute ${
                                    open ? "hidden" : "group-hover:hidden"
                                }`}
                            />
                            <UserPen
                                className={`absolute ${
                                    open ? "" : "hidden group-hover:block"
                                }`}
                            />
                        </div>
                        {player.display_name}
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-2">
                <form
                    onSubmit={(e) => {
                        updatePlayer({ ...player, display_name: nameInput });
                        setOpen(false);
                        e.preventDefault();
                    }}
                >
                    <Input
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                    />
                </form>
                <Button
                    onClick={() => {
                        const player = document.getElementById(
                            `player-${player_id}`
                        );
                        if (!player) {
                            console.error(
                                "[player-icon] unable to locate player to scroll to."
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
            </PopoverContent>
        </Popover>
    );
}
