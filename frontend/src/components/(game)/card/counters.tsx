import { Button } from "@/components/(ui)/button";
import { useCard, useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import type { ShahrazadCardId, ShahrazadCounter } from "@/types/bindings/card";
import { Minus, Plus } from "lucide-react";
import { EditableText } from "@/components/(ui)/editable-text";

function Counter({
    counter,
    setCounter,
}: {
    counter: ShahrazadCounter;
    setCounter: (num?: number) => void;
}) {
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
            <EditableText
                value={counter.amount.toString()}
                onSave={(val) => {
                    const num = Number(val);
                    if (!isNaN(num)) setCounter(num);
                }}
            >
                <Button
                    variant={counter.amount >= 0 ? undefined : "destructive"}
                    size="icon"
                    className="h-[1.2rem] w-[1.2rem]"
                >
                    {counter.amount >= 0
                        ? counter.amount
                        : Math.abs(counter.amount)}
                </Button>
            </EditableText>

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

        const counters = shah_card.state.counters.map((c, i) =>
            i === index ? { ...c, amount } : c,
        );

        applyAction({
            type: ShahrazadActionCase.CardState,
            cards: [id],
            state: {
                counters,
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
