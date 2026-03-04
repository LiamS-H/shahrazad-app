"use client";

import { ShahrazadAction } from "@/types/bindings/action";
import { importMoxfieldUrl } from "./moxfield";
import { IImportOptions, IParsedDeck, toActionList } from "./toActionlist";
import { toast } from "sonner";
import { importArchidektUrl } from "./archidekt";
import { saveDeck } from "../../storage/deck-storage";
import { WUBRG } from "@/types/interfaces/color";

export interface IDeckData {
    website: "moxfield" | "archidekt";
    name: string;
    format: string;
    description: string;
    creator: {
        username: string;
        display: string;
    };
    face_card: {
        id?: string;
        image?: string;
    };
    colors: WUBRG[];
    tags: string[];
    related_card_names: string[];
}

export interface IUrlImport {
    cards: IParsedDeck;
    deck_data: IDeckData;
}

export async function importFromUrl(
    url: string,
    locations: IImportOptions,
): Promise<ShahrazadAction[] | null | undefined> {
    let urlImport: IUrlImport | null = null;
    if (url.match(/^https:\/\/moxfield\.com\/decks\/[a-zA-Z0-9\_\-]{22}$/)) {
        urlImport = await importMoxfieldUrl(url);
    } else if (url.match(/^https:\/\/archidekt\.com\/decks\/\d+\/.*$/)) {
        urlImport = await importArchidektUrl(url);
    } else {
        toast.error("Deck website not supported.");
        return undefined;
    }
    if (!urlImport) return undefined;
    const { cards, deck_data } = urlImport;
    saveDeck(url, deck_data);

    return toActionList(cards, locations);
}
