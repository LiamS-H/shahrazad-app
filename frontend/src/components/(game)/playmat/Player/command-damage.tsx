import { Button } from "@/components/(ui)/button";
import { Input } from "@/components/(ui)/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";

import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import { Minus, Plus } from "lucide-react";
import { type FormEvent, useState } from "react";

export default function CommandDamageButton({
    command_id,
    player_id,
}: {
    command_id: ShahrazadPlaymatId;
    player_id: ShahrazadPlaymatId;
}) {
    const { applyAction, getPlaymat } = useShahrazadGameContext();
    const playmat = getPlaymat(player_id);
    const {
        player: { display_name: command_name },
    } = getPlaymat(command_id);
    const damage = playmat.command_damage[command_id];

    const [open, setOpen] = useState(false);
    const [damageInput, setDamageInput] = useState(damage.toString());

    function setDamage(new_damage?: number) {
        if (new_damage === undefined) return;
        if (new_damage === damage) return;
        applyAction({
            type: ShahrazadActionCase.SetCommand,
            player_id: player_id,
            command_id,
            damage: new_damage,
        });
    }
    function onSubmit(e: FormEvent) {
        e.preventDefault();
        setOpen(false);
        setDamage(parseInput(damageInput));
    }
    function parseInput(str: string): number | undefined {
        const num = Number(str);
        if (Number.isNaN(num)) return undefined;
        return num;
    }

    return (
        <>
            <Popover
                open={open}
                onOpenChange={(open) => {
                    if (!open) {
                        setDamage(parseInput(damageInput));
                        setOpen(open);
                    }
                }}
            >
                <PopoverTrigger asChild>
                    <Button
                        className={`px-0 py-0 h-4 ${
                            player_id !== command_id
                                ? "text-accent-foreground"
                                : undefined
                        }`}
                        variant="outline"
                        key={command_id}
                        onClick={() => {
                            if (open) {
                                setOpen(false);
                                return;
                            }
                            setDamage(damage + 1);
                        }}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            if (!open) {
                                setDamageInput(damage.toString());
                                setOpen(!open);
                            }
                        }}
                    >
                        {command_id !== player_id
                            ? command_name.substring(0, 4)
                            : "Self"}
                        :{damage}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-fit flex gap-2">
                    <form className="order-1" onSubmit={onSubmit}>
                        <Input
                            className="w-16"
                            value={damageInput}
                            onChange={(e) => {
                                const str = e.target.value;
                                const num = parseInput(str);
                                setDamageInput(num ? num.toString() : str);
                            }}
                        />
                    </form>
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                            setDamage(damage - 1);
                            setDamageInput((damage - 1).toString());
                        }}
                    >
                        <Minus />
                    </Button>
                    <Button
                        className="order-2"
                        size="icon"
                        variant="outline"
                        onClick={() => {
                            setDamage(damage + 1);
                            setDamageInput((damage + 1).toString());
                        }}
                    >
                        <Plus />
                    </Button>
                </PopoverContent>
            </Popover>
        </>
    );
}
