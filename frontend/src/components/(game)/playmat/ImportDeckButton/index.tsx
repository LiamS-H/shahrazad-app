import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useShahrazadGameContext } from "@/contexts/game";
import { importFromStr } from "@/lib/importDeck";
import { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { Import } from "lucide-react";
import { useState } from "react";

export function ImportDeckButton({
    deckId,
    commandId,
    playerId,
}: {
    deckId: ShahrazadZoneId;
    commandId: ShahrazadZoneId;
    playerId: ShahrazadPlaymatId;
}) {
    const [input, setInput] = useState<string>("");
    const { applyAction } = useShahrazadGameContext();
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
                            deckId,
                            commandId,
                            playerId
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
