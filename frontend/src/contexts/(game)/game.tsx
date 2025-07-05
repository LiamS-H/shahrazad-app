import { createContext, ReactNode, useContext } from "react";
import type { ShahrazadCard, ShahrazadCardId } from "@/types/bindings/card";
import type { ShahrazadZone, ShahrazadZoneId } from "@/types/bindings/zone";
import type {
    ShahrazadGame,
    ShahrazadGameSettings,
} from "@/types/bindings/game";
import type { ShahrazadAction } from "@/types/bindings/action";
import type {
    ShahrazadPlaymat,
    ShahrazadPlaymatId,
} from "@/types/bindings/playmat";

export interface IShahrazadGameContext {
    active_player: ShahrazadPlaymatId;
    players: ShahrazadPlaymatId[];
    settings: ShahrazadGameSettings;
    created_at: bigint;
    getCard: (arg0: ShahrazadCardId) => ShahrazadCard;
    getZone: (arg0: ShahrazadZoneId) => ShahrazadZone;
    getPlaymat: (arg0: ShahrazadPlaymatId) => ShahrazadPlaymat;
    applyAction: (action: ShahrazadAction) => void;
    isHost: boolean;
}

const ShahrazadGameContext = createContext<IShahrazadGameContext | null>(null);

export function ShahrazadGameProvider(props: {
    game: ShahrazadGame;
    applyAction: (action: ShahrazadAction) => void;
    player_name: ShahrazadPlaymatId;
    players: ShahrazadPlaymatId[];
    isHost: boolean;
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
                settings: props.game.settings,
                active_player: props.player_name,
                players: props.players,
                isHost: props.isHost,
                created_at: props.game.created_at as unknown as bigint,
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
