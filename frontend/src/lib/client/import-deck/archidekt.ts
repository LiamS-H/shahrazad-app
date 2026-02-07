"use server";

import { CardImport } from "@/types/bindings/action";

interface IArchidektCard {
    categories: string[];
    card: {
        uid: string;
    };
    quantity: number;
}

interface IArchidektCategory {
    name: string;
    includedInDeck: boolean;
}

interface IArchidektResponse {
    cards: IArchidektCard[];
    categories: IArchidektCategory[];
}

function getArchidektDeckId(url: string) {
    const regex = /^https:\/\/archidekt\.com\/decks\/(\d+)\/(.*)$/;
    const match = url.match(regex);
    return match ? { slug: match[1], name: match[2] } : null;
}

export async function importArchidektUrl(url: string): Promise<{
    deck: CardImport[];
    sideboard: CardImport[];
} | null> {
    try {
        const deckId = getArchidektDeckId(url);
        if (!deckId) return null;
        const { slug, name } = deckId;
        if (!slug || !name) return null;
        const req_url = `https://www.archidekt.com/api/decks/${slug}/?`;
        const resp = await fetch(req_url);
        const data: IArchidektResponse = await resp.json();
        const sideboard: CardImport[] = [];
        const deck: CardImport[] = [];

        const deck_categories = new Set(
            data.categories
                .filter((c) => c.includedInDeck)
                .map((c) => c.name.toLowerCase()),
        );
        const isCommander = deck_categories.has("commander");

        deck_categories.delete("commander");
        deck_categories.delete("sideboard");

        const sideboard_cat = isCommander ? "commander" : "sideboard";

        for (const card of data.cards) {
            if (card.categories.length == 0) {
                deck.push({
                    str: card.card.uid,
                    amount: card.quantity,
                });
                continue;
            }
            if (
                card.categories.some((c) => c.toLowerCase() === sideboard_cat)
            ) {
                sideboard.push({
                    str: card.card.uid,
                    amount: card.quantity,
                });
                continue;
            }
            if (
                card.categories.some((c) =>
                    deck_categories.has(c.toLowerCase()),
                )
            ) {
                deck.push({
                    str: card.card.uid,
                    amount: card.quantity,
                });
            }
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
