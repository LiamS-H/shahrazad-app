// import { ShahrazadAction, ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadGame } from "@/types/bindings/game";
// import { GameState } from "shahrazad-wasm";

export async function fetchGame(uuid: string): Promise<{
    game: ShahrazadGame;
    game_id: string;
    player_id: string;
    reconnected: false;
}> {
    const res = await fetch(`/api/join_game/${uuid}`);
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
