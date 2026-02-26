import { JoinGameResponse } from "@/types/bindings/api";
import { toast } from "sonner";

const SESSION_KEY = "join-game-cache";

export function cacheJoinResult(result: JoinGameResponse): void {
    try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(result));
    } catch {
        toast.error("sessionStorage unavailable.");
    }
}

export function consumeJoinCache(): JoinGameResponse | null {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        sessionStorage.removeItem(SESSION_KEY);
        return JSON.parse(raw) as JoinGameResponse;
    } catch {
        return null;
    }
}
