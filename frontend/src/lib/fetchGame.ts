// import { ShahrazadAction, ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadGame } from "@/types/bindings/game";
// import { GameState } from "shahrazad-wasm";

export async function fetchGame(
    uuid: string,
    player_id?: string
): Promise<{
    game: ShahrazadGame;
    game_id: string;
    player_id: string;
    reconnected: false;
}> {
    const url = `/api/join_game/${uuid}`;
    //to do replace with local storage fetch to get potential player id
    // const url = new URL(`/api/join_game/${uuid}`); // relative path doesn't work with URL
    // if (player_id) {
    //     url.searchParams.append("payerd_id", player_id);
    // }
    const res = await fetch(url, {
        method: "GET",
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
