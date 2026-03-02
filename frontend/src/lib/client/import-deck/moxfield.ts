"use server";

import { CardImport } from "@/types/bindings/action";
import { IUrlImport } from "./importFromUrl";

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
    name: string;
    description: string;
    format: string;
    createdByUser: {
        userName: string;
        displayName: string;
    };
    commanders: IMoxfieldCardZone;
    mainboard: IMoxfieldCardZone;
    sideboard: IMoxfieldCardZone;
}

function getMoxfieldDeckSlug(url: string) {
    const regex = /^https:\/\/moxfield\.com\/decks\/([a-zA-Z0-9\_\-]{22})$/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

export async function importMoxfieldUrl(
    url: string,
): Promise<IUrlImport | null> {
    try {
        const slug = getMoxfieldDeckSlug(url);
        if (!slug) return null;
        const resp = await fetch(
            `https://api.moxfield.com/v2/decks/all/${slug}`,
        );
        const data: IMoxfieldResponse = await resp.json();
        const sideboard: CardImport[] = [];
        const deck: CardImport[] = [];
        const commander: CardImport[] = [];

        for (const card of Object.values(data.commanders)) {
            commander.push({
                str: card.card.scryfall_id,
            });
        }
        for (const card of Object.values(data.sideboard)) {
            sideboard.push({
                str: card.card.scryfall_id,
                amount: card.quantity,
            });
        }
        for (const card of Object.values(data.mainboard)) {
            deck.push({
                str: card.card.scryfall_id,
                amount: card.quantity,
            });
        }
        return {
            cards: {
                deck,
                commander,
                sideboard,
            },
            deck_data: {
                website: "moxfield",
                format: data.format,
                name: data.name,
                description: data.description,
                creator: {
                    display: data.createdByUser.displayName,
                    username: data.createdByUser.userName,
                },
            },
        };
    } catch (e) {
        console.error(e);
    }
    return null;
}
