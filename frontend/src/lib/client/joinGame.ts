import { JoinGameResponse } from "@/types/bindings/api";

export async function joinGame(
    uuid: string,
    player_id?: string
): Promise<JoinGameResponse | null | undefined> {
    let res: Response;
    try {
        const params = player_id
            ? `?player_id=${encodeURIComponent(player_id)}`
            : ``;
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/join_game/${uuid}${params}`;
        res = await fetch(url, {
            method: "GET",
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
    } catch {
        return undefined;
    }
    try {
        const data = await res.json();
        return data;
    } catch {
        return null;
    }
}
