import { FetchGameResponse } from "@/types/bindings/api";

export async function fetchGame(
    uuid: string
): Promise<FetchGameResponse | null | undefined> {
    let res: Response;
    try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/fetch_game/${uuid}`;
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
