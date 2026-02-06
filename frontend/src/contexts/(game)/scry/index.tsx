import { ShahrazadZoneId } from "@/types/bindings/zone";
import { createContext, useContext, useState, type ReactNode } from "react";
import ScryDialog from "@/components/(game)/scry-dialog";
import { useShahrazadGameContext } from "../game";
import { ShahrazadActionCase } from "@/types/bindings/action";

export interface IScryContext {
    scry: (zone: ShahrazadZoneId | null, amount: number) => void;
    active: ShahrazadZoneId | null;
    amount: number;
}

const ScryContext = createContext<IScryContext | null>(null);

export function useScryContext() {
    const context = useContext(ScryContext);
    if (context === null) {
        throw Error("cannot used scryContext() outside context");
    }
    return context;
}

export function ScryContextProvider({ children }: { children: ReactNode }) {
    const [scryZone, setScryZone] = useState<ShahrazadZoneId | null>(null);
    const [amount, setAmount] = useState(0);
    const { applyAction, getZone, active_player } = useShahrazadGameContext();

    function scry(zone: ShahrazadZoneId | null, amount: number) {
        if (zone) {
            const z = getZone(zone);
            const len = z.cards.length;
            const start = Math.max(0, len - amount);
            const cardsToReveal = z.cards.slice(start);

            applyAction({
                type: ShahrazadActionCase.CardState,
                cards: cardsToReveal,
                state: {
                    revealed: [active_player],
                },
            });
            setScryZone(zone);
            setAmount(amount);
        } else {
            setScryZone(null);
            setAmount(0);
        }
    }

    return (
        <ScryContext.Provider value={{ scry, active: scryZone, amount }}>
            {children}
            <ScryDialog
                active={scryZone}
                amount={amount}
                close={() => scry(null, 0)}
            />
        </ScryContext.Provider>
    );
}
