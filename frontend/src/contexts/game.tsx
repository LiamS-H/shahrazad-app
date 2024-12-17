import { createContext, ReactNode, useContext } from "react";
import { ShahrazadCard, ShahrazadCardId } from "../types/interfaces/card";
import { ShahrazadZone, ShahrazadZoneId } from "../types/interfaces/zone";
import { GameMoveApplier } from "../types/reducers/game";
import { ShahrazadGame } from "../types/interfaces/game";

export interface IShahrazadGameContext {
    getCard: (arg0: ShahrazadCardId) => ShahrazadCard;
    getZone: (arg0: ShahrazadZoneId) => ShahrazadZone;
    applyMove: GameMoveApplier;
}

export const ShahrazadGameContext = createContext<IShahrazadGameContext | null>(
    null,
);

export function ShahrazadGameProvider(props: {
    game: ShahrazadGame;
    applier: GameMoveApplier;
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
                applyMove: props.applier,
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
