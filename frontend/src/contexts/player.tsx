import { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import { createContext, ReactNode, useContext } from "react";
import { useShahrazadGameContext } from "./game";

interface IPlayerContext {
    player: ShahrazadPlaymatId;
    active: boolean;
}

const PlayerContext = createContext<IPlayerContext | null>(null);

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (!context) {
        throw Error("usePlayer() must be called inside a playmat.");
    }
    return context;
}

export function PlayerProvider({
    children,
    player,
    active,
}: {
    children: ReactNode;
    player: string;
    active: boolean;
}) {
    return (
        <PlayerContext.Provider
            value={{
                player,
                active,
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
}
