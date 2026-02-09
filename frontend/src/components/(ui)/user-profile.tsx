import { Button } from "@/components/(ui)/button";
import { Input } from "@/components/(ui)/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";
import { loadPlayer, savePlayer } from "@/lib/client/localPlayer";
import { ShahrazadPlayer } from "@/types/bindings/playmat";
import { LoaderCircle, User, UserPen } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";

export function UserProfile({
    onChange,
    children,
}: {
    onChange?: (player: ShahrazadPlayer) => void;
    children?: ReactNode;
}) {
    const [player, setPlayer] = useState<ShahrazadPlayer | null>(null);
    const [open, setOpen] = useState(false);
    const [nameInput, setNameInput] = useState(player?.display_name ?? "");

    function updatePlayer(
        new_player: Omit<ShahrazadPlayer, "reveal_deck_top"> | null,
    ) {
        if (player?.display_name === new_player?.display_name) return;
        if (new_player === null) return;
        const player_updated: ShahrazadPlayer = {
            ...new_player,
        };
        if (onChange) onChange(player_updated);
        setPlayer(new_player);
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPlayer(loadPlayer()?.player ?? { display_name: "" });
    }, []);

    useEffect(() => {
        if (player) {
            savePlayer(undefined, player);
        }
    }, [player]);

    const triggerButton = useMemo(() => {
        if (player === null) {
            return (
                <Button variant="outline" size="icon">
                    <LoaderCircle className="animate-spin" />
                </Button>
            );
        }
        if (player.display_name === "") {
            return (
                <Button variant="outline" size="icon">
                    <UserPen />
                </Button>
            );
        }
        return (
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
        );
    }, [open, player]);

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
                {triggerButton}
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
                {children}
            </PopoverContent>
        </Popover>
    );
}
