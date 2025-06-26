import { Button } from "@/components/(ui)/button";
import { Input } from "@/components/(ui)/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";

import { Tooltip } from "@/components/(ui)/tooltip";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
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
    const command_playmat = getPlaymat(command_id);
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
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Button
                                className={
                                    player_id !== command_id
                                        ? "text-accent-foreground"
                                        : undefined
                                }
                                variant="outline"
                                size="icon"
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
                                {damage}
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent className="text-foreground">
                        {command_playmat.player.display_name}
                    </TooltipContent>
                </Tooltip>

                <PopoverContent className="w-44 flex gap-1">
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
                    <form onSubmit={onSubmit}>
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
