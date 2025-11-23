import { Button } from "@/components/(ui)/button";
import { ContextMenuItem } from "@/components/(game)/(context-menus)/context-menu";
import { Input } from "@/components/(ui)/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { clamp } from "@/lib/utils/clamp";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadCardStateTransform } from "@/types/bindings/card";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useState } from "react";

export function DrawTo({
    source,
    destination,
    label,
    state,
}: {
    source: ShahrazadZoneId;
    destination: ShahrazadZoneId;
    label: string;
    state?: ShahrazadCardStateTransform;
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
            onClick={() => {
                applyAction({
                    type: ShahrazadActionCase.DrawTop,
                    amount: clamp(amount, 0, source_length),
                    destination,
                    source,
                    state: state || { face_down: false },
                });
            }}
        >
            {label}
            <div
                className="h-full"
                onPointerDown={(e) => e.preventDefault()}
                onClick={(e) => e.stopPropagation()}
            >
                <Button
                    variant="outline"
                    size="icon"
                    className="h-[1.5rem] w-[1.5rem]"
                    onClick={(e) => {
                        e.stopPropagation();
                        setAmount((a) => clamp(a - 1, 1, source_length));
                        setInputOpen(false);
                    }}
                    disabled={amount <= 1}
                >
                    -
                </Button>
                <Popover
                    open={inputOpen}
                    onOpenChange={(open) => {
                        if (open) {
                            setInputOpen(open);
                        }
                        setInputOpen(open);
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
                    <PopoverContent className="p-2 w-fit">
                        <Input
                            className="w-16"
                            value={input}
                            onChange={(e) => {
                                const str = e.target.value;
                                const num = parseInput(str);
                                setInput(num ? num.toString() : str);
                                if (num !== undefined)
                                    setAmount(clamp(num, 1, source_length));
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
                        setAmount((a) => clamp(a + 1, 1, source_length));
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
