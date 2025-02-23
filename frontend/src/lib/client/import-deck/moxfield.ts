"use server";

import { CardImport } from "@/types/bindings/action";

interface IMoxfieldCard {
    card: {
        scryfall_id: string;
    };
    quantity: number;
}

interface IMoxfieldCardZone {
    [key: string]: IMoxfieldCard;
}

interface IMoxfieldResponse {
    commanders: IMoxfieldCardZone;
    format: string;
    mainboard: IMoxfieldCardZone;
    sideboard: IMoxfieldCardZone;
}

function getMoxfieldDeckSlug(url: string) {
    const regex = /^https:\/\/moxfield\.com\/decks\/([a-zA-Z0-9]{22})$/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

export async function importMoxfieldUrl(url: string): Promise<{
    deck: CardImport[];
    sideboard: CardImport[];
} | null> {
    try {
        const slug = getMoxfieldDeckSlug(url);
        if (!slug) return null;
        const resp = await fetch(
            `https://api.moxfield.com/v2/decks/all/${slug}`
        );
        const data: IMoxfieldResponse = await resp.json();
        const sideboard: CardImport[] = [];
        const deck: CardImport[] = [];
        if (data.format == "commander") {
            for (const card of Object.values(data.commanders)) {
                sideboard.push({
                    str: card.card.scryfall_id,
                });
            }
        } else {
            for (const card of Object.values(data.sideboard)) {
                sideboard.push({
                    str: card.card.scryfall_id,
                    amount: card.quantity,
                });
            }
        }
        for (const card of Object.values(data.mainboard)) {
            deck.push({
                str: card.card.scryfall_id,
                amount: card.quantity,
            });
        }
        return {
            deck,
            sideboard,
        };
    } catch (e) {
        console.error(e);
    }
    return null;
}
