import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useShahrazadGameContext } from "@/contexts/game";
import { importFromStr } from "@/lib/importDeck";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { Import } from "lucide-react";
import { useState } from "react";

export function ImportDeckButton({
    deckId,
    commandId,
}: {
    deckId: ShahrazadZoneId;
    commandId: ShahrazadZoneId;
}) {
    const [input, setInput] = useState<string>("");
    const { applyAction, getPlaymat } = useShahrazadGameContext();
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                    <Import className="h-[1.2rem] w-[1.2rem]" />
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <Button
                    onClick={() => {
                        const actions = importFromStr(input, deckId, commandId);
                        actions.forEach((a) => applyAction(a));
                        // applyAction({
                        //     type: ShahrazadActionCase.ZoneImport,
                        //     cards: ["opt"],
                        //     zone: getPlaymat(player_uuid).library,
                        // });
                    }}
                >
                    Import
                </Button>
            </PopoverContent>
        </Popover>
    );
}
