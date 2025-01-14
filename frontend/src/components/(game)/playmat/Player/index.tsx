import { Button } from "@/components/(ui)/button";
import { useShahrazadGameContext } from "@/contexts/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import { Minus, Plus } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";
import { Input } from "@/components/(ui)/input";
import { FormEvent, useState } from "react";

export default function Player({
    player_id,
    active,
}: {
    player_id: ShahrazadPlaymatId;
    active: boolean;
}) {
    const { getPlaymat, applyAction } = useShahrazadGameContext();
    const { life } = getPlaymat(player_id);
    const [lifeInput, setLifeInput] = useState<number>(life);
    const [inputOpen, setInputOpen] = useState(false);

    function addLife() {
        applyAction({
            type: ShahrazadActionCase.SetLife,
            life: life + 1,
            player_id: player_id,
        });
    }
    function subtractLife() {
        applyAction({
            type: ShahrazadActionCase.SetLife,
            life: life - 1,
            player_id: player_id,
        });
    }
    function setLife(life: number) {
        applyAction({
            type: ShahrazadActionCase.SetLife,
            life: life,
            player_id: player_id,
        });
    }
    function onSubmit(e: FormEvent) {
        e.preventDefault();
        setLife(lifeInput);
        setInputOpen(false);
    }

    return (
        <div
            className={`flex flex-col items-center ${
                active && "text-cyan-300"
            }`}
        >
            <Button onClick={addLife} variant="outline" size="icon">
                <Plus className="h-[1.2rem] w-[1.2rem]" />
            </Button>
            <Popover
                open={inputOpen}
                onOpenChange={(open) => {
                    setLife(lifeInput);
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
                                const num = Number(e.target.value);
                                if (!num && e.target.value !== "") return;
                                setLifeInput(num);
                            }}
                        />
                    </form>
                </PopoverContent>
            </Popover>
            <Button onClick={subtractLife} variant="outline" size="icon">
                <Minus className="h-[1.2rem] w-[1.2rem]" />
            </Button>
        </div>
    );
}
