import { JoinGameResponse } from "@/types/bindings/api";

export async function fetchGame(
    uuid: string,
    player_id?: string
): Promise<JoinGameResponse> {
    const params = player_id
        ? `?player_id=${encodeURIComponent(player_id)}`
        : ``;
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/join_game/${uuid}${params}`;
    const res = await fetch(url, {
        method: "GET",
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
}
