import { Button } from "@/components/(ui)/button";
import { Input } from "@/components/(ui)/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";
import { useCard, useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import type { ShahrazadCardId, ShahrazadCounter } from "@/types/bindings/card";
import { Minus, Plus } from "lucide-react";
import { type FormEvent, useState } from "react";

function Counter({
    counter,
    setCounter,
}: {
    counter: ShahrazadCounter;
    setCounter: (num?: number) => void;
}) {
    const [input, setInput] = useState(counter.amount.toString());

    const [inputOpen, setInputOpen] = useState(false);
    function onSubmit(e: FormEvent) {
        e.preventDefault();
        setCounter(parseInput(input));
        setInputOpen(false);
    }
    function parseInput(str: string): number | undefined {
        const num = Number(str);
        if (!num) return undefined;
        if (num > 99) return 99;
        if (num < -99) return -99;
        return num;
    }
    return (
        <div className="flex flex-col">
            <Button
                size="icon"
                className="h-[1.2rem] w-[1.2rem]"
                disabled={counter.amount >= 99}
                onClick={() => {
                    setCounter(counter.amount + 1);
                }}
            >
                <Plus />
            </Button>
            <Popover
                open={inputOpen}
                onOpenChange={(open) => {
                    if (open) {
                        setInput(counter.amount.toString());
                    } else {
                        setCounter(parseInput(input));
                    }
                    setInputOpen(open);
                }}
            >
                <PopoverTrigger asChild>
                    <Button
                        variant={
                            counter.amount >= 0 ? undefined : "destructive"
                        }
                        size="icon"
                        className="h-[1.2rem] w-[1.2rem]"
                    >
                        {counter.amount >= 0
                            ? counter.amount
                            : Math.abs(counter.amount)}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-24" data-nodrag>
                    <form onSubmit={onSubmit}>
                        <Input
                            value={input}
                            onChange={(e) => {
                                const str = e.target.value;
                                const num = parseInput(str);
                                setInput(num ? num.toString() : str);
                            }}
                        />
                    </form>
                </PopoverContent>
            </Popover>

            <Button
                size="icon"
                className="h-[1.2rem] w-[1.2rem]"
                disabled={counter.amount <= -99}
                onClick={() => {
                    setCounter(counter.amount - 1);
                }}
            >
                <Minus />
            </Button>
        </div>
    );
}

export default function Counters({ id }: { id: ShahrazadCardId }) {
    const { applyAction } = useShahrazadGameContext();
    const shah_card = useCard(id);
    if (!shah_card.state.counters) {
        return null;
    }

    function setCounter(index: number, amount?: number) {
        if (amount === undefined) return;
        if (!shah_card.state.counters) return;
        if (shah_card.state.counters[index].amount === amount) return;

        shah_card.state.counters[index].amount = amount;
        applyAction({
            type: ShahrazadActionCase.CardState,
            cards: [id],
            state: {
                counters: shah_card.state.counters,
            },
        });
    }

    return (
        <div className="relative">
            <div className="absolute bottom-1 flex flex-row justify-between w-full">
                {shah_card.state.counters.map((c, i) => (
                    <Counter
                        key={i}
                        counter={c}
                        setCounter={(n) => setCounter(i, n)}
                    />
                ))}
            </div>
        </div>
    );
}
