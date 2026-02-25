import { Button } from "@/components/(ui)/button";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { Minus, Plus } from "lucide-react";
import { ImportDeckButton } from "../(buttons)/ImportDeckButton";
import { ClearBoardButton } from "../(buttons)/ClearBoardButton";
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
            className={`flex h-[140px] ${active && "text-highlight"}`}
        >
            <div className="flex flex-col justify-around">
                <ImportDeckButton />
                <ClearBoardButton />
            </div>
            <div className="flex flex-col justify-center items-center">
                <Button onClick={addLife} variant="outline" size="icon">
                    <Plus className="h-[1.2rem] w-[1.2rem]" />
                </Button>
                <EditableText
                    value={life.toString()}
                    onSave={(val) => {
                        const num = Number(val);
                        if (!isNaN(num)) setLife(num);
                    }}
                >
                    <h1 className="text-5xl cursor-pointer">{life}</h1>
                </EditableText>
                <Button onClick={subtractLife} variant="outline" size="icon">
                    <Minus className="h-[1.2rem] w-[1.2rem]" />
                </Button>
            </div>
            {settings.commander && (
                <div className="flex flex-col justify-around">
                    {players.map((command_id) => (
                        <CommandDamageButton
                            key={command_id}
                            command_id={command_id}
                            player_id={player}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
