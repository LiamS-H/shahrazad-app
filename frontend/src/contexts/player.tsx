import { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import { createContext, ReactNode, useContext } from "react";

const PlayerContext = createContext<string | null>(null);

export function usePlayer(): ShahrazadPlaymatId {
    const player = useContext(PlayerContext);
    if (!player) {
        throw Error("usePlayer() must be called inside a playmat.");
    }
    return player;
}

export function PlayerProvider({
    children,
    player,
}: {
    children: ReactNode;
    player: string;
}) {
    return (
        <PlayerContext.Provider value={player}>
            {children}
        </PlayerContext.Provider>
    );
}
