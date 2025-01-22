import { Button } from "@/components/(ui)/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";
import { Textarea } from "@/components/(ui)/textarea";
import { useShahrazadGameContext } from "@/contexts/game";
import { usePlayer } from "@/contexts/player";
import { importFromStr } from "@/lib/client/importDeck";
import { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { Import } from "lucide-react";
import { useState } from "react";

export function ImportDeckButton() {
    const { applyAction, getPlaymat } = useShahrazadGameContext();
    const player = usePlayer();
    const playmat = getPlaymat(player);
    const [input, setInput] = useState<string>("");
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                    <Import className="h-[1.2rem] w-[1.2rem]" />
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <Textarea
                    className="min-h-24"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <Button
                    onClick={() => {
                        const actions = importFromStr(
                            input,
                            playmat.library,
                            playmat.command,
                            player
                        );
                        actions.forEach((a) => applyAction(a));
                    }}
                >
                    Import
                </Button>
            </PopoverContent>
        </Popover>
    );
}
