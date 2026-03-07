"use client";

import { CreateGameResponse, CreateGameQuery } from "@/types/bindings/api";

export async function createGame(
    props: CreateGameQuery
): Promise<CreateGameResponse | null> {
    try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/create_game`;
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(props),
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        return data;
    } catch {
        return null;
    }
}
