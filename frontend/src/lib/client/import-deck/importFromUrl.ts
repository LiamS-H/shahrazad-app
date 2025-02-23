"use client";

import { ShahrazadAction } from "@/types/bindings/action";
import { importMoxfieldUrl } from "./moxfield";
import { ILocations, toActionList } from "./toActionlist";

export async function importFromUrl(
    url: string,
    locations: ILocations
): Promise<ShahrazadAction[] | null | undefined> {
    if (url.match(/^https:\/\/moxfield\.com\/decks\/[a-zA-Z0-9]{22}$/)) {
        const cards = await importMoxfieldUrl(url);
        if (!cards) return undefined;

        return toActionList(cards, locations);
    }

    return null;
}
