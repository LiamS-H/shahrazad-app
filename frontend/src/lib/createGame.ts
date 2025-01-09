"use client";

import { CreateGameResponse } from "@/types/bindings/api";

export async function createGame(
    settings: unknown
): Promise<CreateGameResponse> {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/create_game`;
    console.log(url);
    const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(settings),
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    console.log("createGame", data);
    return data;
}
