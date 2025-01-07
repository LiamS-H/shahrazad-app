"use client";

import { CreateGameResponse } from "@/types/bindings/api";

export async function createGame(settings: any): Promise<CreateGameResponse> {
    const res = await fetch("api/create_game", {
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
