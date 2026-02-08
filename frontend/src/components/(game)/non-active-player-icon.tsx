import { Button } from "@/components/(ui)/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";
import { EllipsisVertical, User, UserSearch } from "lucide-react";
import type { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { useState } from "react";
import { ShahrazadActionCase } from "@/types/bindings/action";

export function NonActivePlayerIcon({
    player_id,
}: {
    player_id: ShahrazadPlaymatId;
}) {
    const { getPlaymat, applyAction, isHost } = useShahrazadGameContext();
    const playmat = getPlaymat(player_id);
    const player = playmat.player;
    const [open, setOpen] = useState(false);

    return (
        <div className="flex items-center">
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
                className="group"
                variant="outline"
            >
                <div className="h-full w-4 relative">
                    <User className={`absolute group-hover:hidden`} />
                    <UserSearch
                        className={`absolute hidden group-hover:block`}
                    />
                </div>
                {player.display_name}
            </Button>
            {isHost && (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger>
                        <EllipsisVertical />
                    </PopoverTrigger>
                    <PopoverContent className="flex flex-col gap-2">
                        <Button
                            variant="destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                applyAction({
                                    type: ShahrazadActionCase.SetPlayer,
                                    player_id,
                                });
                            }}
                        >
                            Kick Player
                        </Button>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
}
