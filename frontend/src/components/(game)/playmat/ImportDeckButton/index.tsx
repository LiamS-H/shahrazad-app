import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useShahrazadGameContext } from "@/contexts/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { Plus } from "lucide-react";
import { useState } from "react";

export function ImportDeckButton({ player_uuid }: { player_uuid: string }) {
    const [input, setInput] = useState<string>("");
    const { applyAction, getPlaymat } = useShahrazadGameContext();
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                    <Plus className="h-[1.2rem] w-[1.2rem]" />
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <Button
                    onClick={() => {
                        console.log("importing deck");
                        applyAction({
                            type: ShahrazadActionCase.ZoneImport,
                            cards: ["opt"],
                            zone: getPlaymat(player_uuid).library,
                        });
                    }}
                >
                    Import
                </Button>
            </PopoverContent>
        </Popover>
    );
}
