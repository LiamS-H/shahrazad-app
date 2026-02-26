import { Button } from "@/components/(ui)/button";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { Minus, Plus } from "lucide-react";
import { ImportDeckButton } from "../(buttons)/ImportDeckButton";
import { usePlayer } from "@/contexts/(game)/player";
import CommandDamageButton from "./command-damage";
import { EditableText } from "@/components/(ui)/editable-text";

export default function Player() {
    const { player, active } = usePlayer();
    const { getPlaymat, applyAction, players, settings } =
        useShahrazadGameContext();
    const playmat = getPlaymat(player);
    const { life } = playmat;

    function addLife() {
        applyAction({
            type: ShahrazadActionCase.SetLife,
            life: life + 1,
            player_id: player,
        });
    }
    function subtractLife() {
        applyAction({
            type: ShahrazadActionCase.SetLife,
            life: life - 1,
            player_id: player,
        });
    }
    function setLife(new_life?: number) {
        if (new_life === undefined) return;
        if (new_life === life) return;
        applyAction({
            type: ShahrazadActionCase.SetLife,
            life: new_life,
            player_id: player,
        });
    }

    return (
        <div
            data-shahplayer={player}
            className={`relative flex flex-col h-[140px] w-[120px] -mx-3 p-1 border border-highlight ${active && "text-highlight"}`}
        >
            <div className="absolute -top-2 -right-2">
                <ImportDeckButton variant="ghost" />
            </div>
            <div className="text-2xl">{playmat.player.display_name}</div>

            <div className="flex justify-center z-10 items-center">
                <Button
                    className="absolute -left-1 hover:bg-secondary"
                    onClick={subtractLife}
                    variant="ghost"
                    size="icon"
                >
                    <Minus className="h-[1.2rem] w-[1.2rem]" />
                </Button>
                <EditableText
                    value={life.toString()}
                    onSave={(val) => {
                        const num = Number(val);
                        if (!isNaN(num)) setLife(num);
                    }}
                >
                    <div className="p-2 -m-2 rounded-full bg-transparent group hover:bg-secondary">
                        <h1 className="text-5xl group-hover:text-white">
                            {life}
                        </h1>
                    </div>
                </EditableText>
                <Button
                    className="absolute -right-1 hover:bg-secondary"
                    onClick={addLife}
                    variant="ghost"
                    size="icon"
                >
                    <Plus className="h-[1.2rem] w-[1.2rem]" />
                </Button>
            </div>
            {settings.commander && (
                <>
                    <span className="text-[10px]">Command Dammage:</span>
                    <div className="flex flex-wrap justify-around">
                        {players.map((command_id) => {
                            return (
                                <CommandDamageButton
                                    key={command_id}
                                    command_id={command_id}
                                    player_id={player}
                                />
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
