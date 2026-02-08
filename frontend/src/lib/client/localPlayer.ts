import { ShahrazadPlayer } from "@/types/bindings/playmat";

export function loadPlayer():
    | {
          player?: ShahrazadPlayer;
          player_id?: string;
      }
    | undefined {
    try {
        localStorage.getItem("");
    } catch {
        return undefined;
    }
    const stored_player = localStorage.getItem("saved-player");
    const player_id = localStorage.getItem("saved-player-id") ?? undefined;
    if (stored_player === null) return { player_id };
    try {
        const player: ShahrazadPlayer = JSON.parse(stored_player);
        return { player, player_id };
    } catch {
        return { player_id };
    }
}

export function savePlayer(player_id?: string, player?: ShahrazadPlayer): void {
    if (player_id) {
        localStorage.setItem("saved-player-id", player_id);
    }
    if (player) {
        localStorage.setItem("saved-player", JSON.stringify(player));
    }
}
