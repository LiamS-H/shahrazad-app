"use server";

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
    deck: string[];
    sideboard: string[];
} | null> {
    try {
        const slug = getMoxfieldDeckSlug(url);
        if (!slug) return null;
        const resp = await fetch(
            `https://api.moxfield.com/v2/decks/all/${slug}`
        );
        const data: IMoxfieldResponse = await resp.json();
        const sideboard: string[] = [];
        const deck: string[] = [];
        if (data.format == "commander") {
            for (const card of Object.values(data.commanders)) {
                sideboard.push(card.card.scryfall_id);
            }
        } else {
            for (const card of Object.values(data.sideboard)) {
                for (let i = 0; i < card.quantity; i++) {
                    sideboard.push(card.card.scryfall_id);
                }
            }
        }
        for (const card of Object.values(data.mainboard)) {
            for (let i = 0; i < card.quantity; i++) {
                deck.push(card.card.scryfall_id);
            }
        }
        return {
            deck,
            sideboard,
        };
    } catch (e) {
        console.log(e);
    }
    return null;
}
