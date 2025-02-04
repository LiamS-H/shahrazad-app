import { Button } from "@/components/(ui)/button";
import { ContextMenuItem } from "@/components/(ui)/context-menu";
import { Input } from "@/components/(ui)/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";
import { useShahrazadGameContext } from "@/contexts/game";
import { clamp } from "@/lib/utils/clamp";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadCardState } from "@/types/bindings/card";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { FormEvent, useState } from "react";

export function DrawTo({
    source,
    destination,
    label,
    state,
}: {
    source: ShahrazadZoneId;
    destination: ShahrazadZoneId;
    label: string;
    state?: ShahrazadCardState;
}) {
    const { applyAction, getZone } = useShahrazadGameContext();

    const {
        cards: { length: source_length },
    } = getZone(source);
    const [amount, setAmount] = useState(1);

    const [inputOpen, setInputOpen] = useState(false);
    const [input, setInput] = useState(amount.toString());

    function parseInput(str: string): number | undefined {
        const num = Number(str);
        if (Number.isNaN(num)) return undefined;
        return num;
    }

    return (
        <ContextMenuItem
            className="w-full flex justify-between gap-2"
            onClick={(e) => {
                if (amount < 0) return;
                if (amount > source_length) return;
                applyAction({
                    type: ShahrazadActionCase.DrawTop,
                    amount: amount,
                    destination,
                    source,
                    state: state || { face_down: false },
                });
            }}
            onPointerMove={(e) => {
                if (inputOpen) e.preventDefault();
            }}
        >
            {label}
            <div className="h-full">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-[1.5rem] w-[1.5rem]"
                    onClick={(e) => {
                        e.stopPropagation();
                        setAmount((a) => clamp(a - 1, 0, source_length));
                        setInputOpen(false);
                    }}
                    disabled={amount <= 0}
                >
                    -
                </Button>
                <Popover
                    open={inputOpen}
                    onOpenChange={(open) => {
                        if (open) {
                            setInputOpen(open);
                        }
                    }}
                >
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-[1.5rem] w-[1.5rem]"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (inputOpen) setInputOpen(false);
                            }}
                        >
                            {amount}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="p-2 w-fit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Input
                            className="w-16"
                            value={input}
                            onChange={(e) => {
                                const str = e.target.value;
                                const num = parseInput(str);
                                setInput(num ? num.toString() : str);
                                if (num !== undefined)
                                    setAmount(clamp(num, 0, source_length));
                            }}
                        />
                    </PopoverContent>
                </Popover>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-[1.5rem] w-[1.5rem]"
                    onClick={(e) => {
                        e.stopPropagation();
                        setAmount((a) => clamp(a + 1, 0, source_length));
                        setInputOpen(false);
                    }}
                    disabled={amount >= source_length}
                >
                    +
                </Button>
            </div>
        </ContextMenuItem>
    );
}
