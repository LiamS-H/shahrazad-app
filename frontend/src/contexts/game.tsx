import { createContext, ReactNode, useContext } from "react";
import type { ShahrazadCard, ShahrazadCardId } from "@/types/bindings/card";
import type { ShahrazadZone, ShahrazadZoneId } from "@/types/bindings/zone";
import type { ShahrazadGame } from "@/types/bindings/game";
import type { ShahrazadAction } from "@/types/bindings/action";
import type {
    ShahrazadPlaymat,
    ShahrazadPlaymatId,
} from "@/types/bindings/playmat";

export interface IShahrazadGameContext {
    player_name: string;
    getCard: (arg0: ShahrazadCardId) => ShahrazadCard;
    getZone: (arg0: ShahrazadZoneId) => ShahrazadZone;
    getPlaymat: (arg0: ShahrazadPlaymatId) => ShahrazadPlaymat;
    applyAction: (action: ShahrazadAction) => void;
}

const ShahrazadGameContext = createContext<IShahrazadGameContext | null>(null);

export function ShahrazadGameProvider(props: {
    game: ShahrazadGame;
    applyAction: (action: ShahrazadAction) => void;
    player_name: string;
    children: ReactNode;
}) {
    function getCard(card: ShahrazadCardId): ShahrazadCard {
        return props.game.cards[card];
    }
    function getZone(zone: ShahrazadZoneId): ShahrazadZone {
        return props.game.zones[zone];
    }
    function getPlaymat(player: ShahrazadPlaymatId): ShahrazadPlaymat {
        return props.game.playmats[player];
    }

    return (
        <ShahrazadGameContext.Provider
            value={{
                player_name: props.player_name,
                getCard,
                getZone,
                getPlaymat,
                applyAction: props.applyAction,
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
