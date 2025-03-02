"use client";

import { ShahrazadAction } from "@/types/bindings/action";
import { importMoxfieldUrl } from "./moxfield";
import { IImportOptions, toActionList } from "./toActionlist";
import { toast } from "sonner";

export async function importFromUrl(
    url: string,
    locations: IImportOptions
): Promise<ShahrazadAction[] | null | undefined> {
    if (url.match(/^https:\/\/moxfield\.com\/decks\/[a-zA-Z0-9\_\-]{22}$/)) {
        const cards = await importMoxfieldUrl(url);
        if (!cards) return undefined;

        return toActionList(cards, locations);
    }
    toast("Deck website not supported.");

    return undefined;
}
//https://moxfield.com/decks/R6a3e2uNbkijLU8-LNV5Uw
//https://moxfield.com/decks/WbOxBONUYEehbHg9E83kgA
