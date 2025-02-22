"use client";

import { ShahrazadAction, ShahrazadActionCase } from "@/types/bindings/action";
import { importMoxfieldUrl } from "./moxfield";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { ShahrazadPlaymatId } from "@/types/bindings/playmat";

export async function importFromUrl(
    url: string,
    deckId: ShahrazadZoneId,
    commandId: ShahrazadZoneId,
    playerId: ShahrazadPlaymatId
): Promise<ShahrazadAction[] | null | undefined> {
    const importActions: ShahrazadAction[] = [];
    if (url.match(/^https:\/\/moxfield\.com\/decks\/[a-zA-Z0-9]{22}$/)) {
        const cards = await importMoxfieldUrl(url);
        if (!cards) return undefined;
        const { deck, sideboard } = cards;
        if (deck.length === 0 && sideboard.length === 0) return null;
        importActions.push({
            type: ShahrazadActionCase.ZoneImport,
            cards: deck,
            zone: deckId,
            player_id: playerId,
            token: false,
        });
        importActions.push({
            type: ShahrazadActionCase.ZoneImport,
            cards: sideboard,
            zone: commandId,
            player_id: playerId,
            token: false,
        });
        return importActions;
    }

    return null;
}
