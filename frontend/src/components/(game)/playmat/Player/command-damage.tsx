import { Button } from "@/components/(ui)/button";
import { Tooltip } from "@/components/(ui)/tooltip";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { EditableText } from "@/components/(ui)/editable-text";

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

    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <EditableText
                        asChild
                        open={open}
                        onOpenChange={setOpen}
                        value={damage.toString()}
                        onSave={(val) => {
                            const num = Number(val);
                            if (!isNaN(num)) setDamage(num);
                        }}
                        contentClassName="w-44"
                        beforeInput={
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                    setDamage(damage - 1);
                                }}
                            >
                                <Minus />
                            </Button>
                        }
                        afterInput={
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                    setDamage(damage + 1);
                                }}
                            >
                                <Plus />
                            </Button>
                        }
                    >
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
                                    setOpen(true);
                                }
                            }}
                        >
                            {damage}
                        </Button>
                    </EditableText>
                </TooltipTrigger>
                <TooltipContent className="text-foreground">
                    {command_playmat.player.display_name}
                </TooltipContent>
            </Tooltip>
        </>
    );
}
