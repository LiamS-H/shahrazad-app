import { Button } from "@/components/(ui)/button";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { Minus, Plus } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";
import { Input } from "@/components/(ui)/input";
import { FormEvent, useState } from "react";
import { ImportDeckButton } from "../(buttons)/ImportDeckButton";
import { ClearBoardButton } from "../(buttons)/ClearBoardButton";
import { usePlayer } from "@/contexts/(game)/player";
import CommandDamageButton from "./command-damage";

export default function Player() {
    const { player, active } = usePlayer();
    const { getPlaymat, applyAction, players, settings } =
        useShahrazadGameContext();
    const playmat = getPlaymat(player);
    const { life } = playmat;
    const [lifeInput, setLifeInput] = useState<string>(life.toString());
    const [inputOpen, setInputOpen] = useState(false);

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
    function parseInput(str: string): number | undefined {
        const num = Number(str);
        if (Number.isNaN(num)) return undefined;
        return num;
    }
    function onSubmit(e: FormEvent) {
        e.preventDefault();
        setLife(parseInput(lifeInput));
        setInputOpen(false);
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
                <Popover
                    open={inputOpen}
                    onOpenChange={(open) => {
                        if (open) {
                            setLifeInput(life.toString());
                        } else {
                            setLife(parseInput(lifeInput));
                        }
                        setInputOpen(open);
                    }}
                >
                    <PopoverTrigger>
                        <h1 className="text-5xl">{life}</h1>
                    </PopoverTrigger>
                    <PopoverContent className="w-24">
                        <form onSubmit={onSubmit}>
                            <Input
                                value={lifeInput}
                                onChange={(e) => {
                                    const str = e.target.value;
                                    const num = parseInput(str);
                                    setLifeInput(num ? num.toString() : str);
                                }}
                            />
                        </form>
                    </PopoverContent>
                </Popover>
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
