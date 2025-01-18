import { Button } from "@/components/(ui)/button";
import { useShahrazadGameContext } from "@/contexts/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import type { ShahrazadCardId } from "@/types/bindings/card";
import { Minus, Plus } from "lucide-react";

export default function Counters({ id }: { id: ShahrazadCardId }) {
    const { applyAction, getCard } = useShahrazadGameContext();
    const shah_card = getCard(id);

    if (!shah_card.state.counters) {
        return null;
    }
    return (
        <div className="relative">
            <div className="absolute bottom-1 flex flex-row justify-between w-full">
                {shah_card.state.counters.map((c, i) => (
                    <div className="flex flex-col" key={i}>
                        <Button
                            size="icon"
                            className="h-[1.2rem] w-[1.2rem]"
                            onClick={() => {
                                (shah_card.state.counters || [])[i].amount += 1;
                                applyAction({
                                    type: ShahrazadActionCase.CardState,
                                    cards: [id],
                                    state: {
                                        counters: shah_card.state.counters,
                                    },
                                });
                            }}
                        >
                            <Plus />
                        </Button>
                        {c.amount}
                        <Button
                            size="icon"
                            className="h-[1.2rem] w-[1.2rem]"
                            onClick={() => {
                                (shah_card.state.counters || [])[i].amount -= 1;
                                applyAction({
                                    type: ShahrazadActionCase.CardState,
                                    cards: [id],
                                    state: {
                                        counters: shah_card.state.counters,
                                    },
                                });
                            }}
                        >
                            <Minus />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
