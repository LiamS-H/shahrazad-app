"use server";

import { CardImport } from "@/types/bindings/action";
import { IUrlImport } from "./importFromUrl";

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
    name: string;
    description: string;
    deckFormat: number;
    owner: {
        username: string;
    };
    cards: IArchidektCard[];
    categories: IArchidektCategory[];
}

const formats: Record<number, string> = {
    3: "commander",
};

function getArchidektDeckId(url: string) {
    const regex = /^https:\/\/archidekt\.com\/decks\/(\d+)\/(.*)$/;
    const match = url.match(regex);
    return match ? { slug: match[1], name: match[2] } : null;
}

export async function importArchidektUrl(
    url: string,
): Promise<IUrlImport | null> {
    try {
        const deckId = getArchidektDeckId(url);
        if (!deckId) return null;
        const { slug, name } = deckId;
        if (!slug || !name) return null;
        const req_url = `https://www.archidekt.com/api/decks/${slug}/?`;
        const resp = await fetch(req_url);
        const data: IArchidektResponse = await resp.json();
        console.log(data);
        const sideboard: CardImport[] = [];
        const commander: CardImport[] = [];
        const deck: CardImport[] = [];

        const deck_categories = new Set(
            data.categories
                .filter((c) => c.includedInDeck)
                .map((c) => c.name.toLowerCase()),
        );

        deck_categories.delete("commander");
        deck_categories.delete("sideboard");

        for (const card of data.cards) {
            if (card.categories.length == 0) {
                deck.push({
                    str: card.card.uid,
                    amount: card.quantity,
                });
                continue;
            }
            if (card.categories.some((c) => c.toLowerCase() === "sideboard")) {
                sideboard.push({
                    str: card.card.uid,
                    amount: card.quantity,
                });
                continue;
            }
            if (card.categories.some((c) => c.toLowerCase() === "commander")) {
                commander.push({
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
            cards: {
                deck,
                commander,
                sideboard,
            },
            deck_data: {
                format: formats[data.deckFormat] ?? "unknown",
                name: data.name,
                description: data.description,
                website: "archidekt",
                creator: {
                    display: data.owner.username,
                    username: data.owner.username,
                },
            },
        };
    } catch (e) {
        console.error(e);
    }
    return null;
}
