import { Button } from "@/components/(ui)/button";
import { ContextMenuItem } from "@/components/(game)/(context-menus)/context-menu";
import { Input } from "@/components/(ui)/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";
import { clamp } from "@/lib/utils/clamp";
import { useState } from "react";

export function NumberContextItem({
    label,
    minimum = 1,
    maximum,
    onSubmit,
    disabled,
}: {
    label: string;
    minimum?: number;
    maximum: number;
    onSubmit: (value: number) => void;
    disabled?: boolean;
}) {
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
            onClick={() => onSubmit(clamp(amount, minimum, maximum))}
            disabled={disabled}
        >
            {label}
            <div
                className="h-full flex items-center"
                onPointerDown={(e) => e.preventDefault()}
                onClick={(e) => e.stopPropagation()}
            >
                <Button
                    variant="outline"
                    size="icon"
                    className="h-[1.5rem] w-[1.5rem]"
                    onClick={(e) => {
                        e.stopPropagation();
                        setAmount((a) => clamp(a - 1, minimum, maximum));
                        setInputOpen(false);
                    }}
                    disabled={amount <= minimum}
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
                                    setAmount(clamp(num, minimum, maximum));
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
                        setAmount((a) => clamp(a + 1, 1, maximum));
                        setInputOpen(false);
                    }}
                    disabled={amount >= maximum}
                >
                    +
                </Button>
            </div>
        </ContextMenuItem>
    );
}
