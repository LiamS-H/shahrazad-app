import { createContext, ReactNode, useContext } from "react";
import { ShahrazadCard, ShahrazadCardId } from "@/types/bindings/card";
import { ShahrazadZone, ShahrazadZoneId } from "@/types/bindings/zone";
import { ShahrazadGame } from "@/types/bindings/game";
import { ShahrazadAction } from "@/types/bindings/action";

export interface IShahrazadGameContext {
    getCard: (arg0: ShahrazadCardId) => ShahrazadCard;
    getZone: (arg0: ShahrazadZoneId) => ShahrazadZone;
    applyAction: (action: ShahrazadAction) => void;
}

export const ShahrazadGameContext = createContext<IShahrazadGameContext | null>(
    null
);

export function ShahrazadGameProvider(props: {
    game: ShahrazadGame;
    applier: (action: ShahrazadAction) => void;
    children: ReactNode;
}) {
    function getCard(card: ShahrazadCardId): ShahrazadCard {
        return props.game.cards[card];
    }
    function getZone(zone: ShahrazadZoneId): ShahrazadZone {
        return props.game.zones[zone];
    }

    return (
        <ShahrazadGameContext.Provider
            value={{
                getCard,
                getZone,
                applyAction: props.applier,
            }}
        >
            {props.children}
        </ShahrazadGameContext.Provider>
    );
}

export function useShahrazadGameContext() {
    const context = useContext(ShahrazadGameContext);
    if (!context) {
        throw new Error("useShahrazadGameContext only works inside provider.");
    }
    return context;
}
