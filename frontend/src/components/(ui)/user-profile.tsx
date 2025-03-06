import { Button } from "@/components/(ui)/button";
import { Input } from "@/components/(ui)/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";
import { loadPlayer, savePlayer } from "@/lib/client/localPlayer";
import { ShahrazadPlayer } from "@/types/bindings/playmat";
import { User, UserPen } from "lucide-react";
import { useEffect, useState } from "react";

export function UserProfile({
    onChange,
}: {
    onChange?: (player: ShahrazadPlayer) => void;
}) {
    const [player, setPlayer] = useState<ShahrazadPlayer | null>(null);
    const [open, setOpen] = useState(false);
    const [nameInput, setNameInput] = useState(player?.display_name || "");

    function updatePlayer(new_player: ShahrazadPlayer | null) {
        if (player?.display_name === new_player?.display_name) return;
        if (new_player === null) return;
        if (onChange) onChange(new_player);
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
            <PopoverTrigger asChild>
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
            <PopoverContent>
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
            </PopoverContent>
        </Popover>
    );
}
