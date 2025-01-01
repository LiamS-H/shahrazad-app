"use client";
export async function createGame(settings: any): Promise<{
    game_id: string;
    playerd_id: string;
}> {
    // set local storage player_uuid
    const res = await fetch("api/create_game", {
        method: "POST",
        body: JSON.stringify(settings),
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();

    // return {
    //     game: {
    //         zone_count: 0,
    //         card_count: 0,
    //         cards: {},
    //         zones: {
    //             ZONE_1: { cards: [] },
    //             ZONE_2: { cards: [] },
    //             ZONE_3: { cards: [] },
    //             ZONE_4: { cards: [] },
    //             ZONE_5: { cards: [] },
    //             ZONE_6: { cards: [] },
    //         },
    //         playmats: {
    //             "server-uuid": {
    //                 library: "ZONE_1",
    //                 hand: "ZONE_2",
    //                 graveyard: "ZONE_3",
    //                 battlefield: "ZONE_4",
    //                 exile: "ZONE_5",
    //                 command: "ZONE_6",
    //             },
    //         },
    //         players: ["server-uuid"],
    //     },
    //     uuid: "server-uuid",
    // };
}
