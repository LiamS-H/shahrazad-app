"use client";

import { CreateGameResponse, CreateGameQuery } from "@/types/bindings/api";

export async function createGame(
    settings: CreateGameQuery
): Promise<CreateGameResponse> {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/create_game`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    console.log("createGame", data);
    return data;
}
