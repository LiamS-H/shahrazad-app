import { JoinGameQuery, JoinGameResponse } from "@/types/bindings/api";

export async function joinGame(
    uuid: string,
    player?: JoinGameQuery
): Promise<JoinGameResponse | null | undefined> {
    let res: Response;
    try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/join_game/${uuid}`;
        res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(player) || "{}",
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
