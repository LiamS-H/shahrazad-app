"use server";

import { CardImport } from "@/types/bindings/action";
import { IUrlImport } from "./importFromUrl";
import { sortWUBRG } from "@/lib/utils/sort-wubrg";
import { WUBRG } from "@/types/interfaces/color";

type IArchiDektColors = ("White" | "Blue" | "Black" | "Red" | "Green")[]; // empty is colorless

interface IArchidektOracleCard {
    colorIdentity: IArchiDektColors;
    manaProduction: Record<WUBRG, number | null>;
    name: string;
}

interface IArchidektCard {
    uid: string;
    oracleCard: IArchidektOracleCard;
}

interface IArchidektDeckCard {
    categories: string[];
    card: IArchidektCard;
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
    featured: string;
    cards: IArchidektDeckCard[];
    categories: IArchidektCategory[];
    deckTags: string[];
}

const formats: Record<number, string> = {
    1: "standard",
    2: "modern",
    3: "commander",
    4: "legacy",
    5: "vintage",
    6: "pauper",
    7: "custom",
    8: "frontier",
    9: "future standard",
    10: "penny dreadful",
    11: "1v1 commander",
    12: "duel commander",
    13: "standard brawl",
    14: "oathbreaker",
    15: "pioneer",
    16: "historic",
    17: "pauper edh",
    18: "alchemy",
    20: "brawl",
    21: "gladiator",
    22: "premodern",
    23: "predh",
    24: "timeless",
    25: "canadian highlander",
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
        const sideboard: CardImport[] = [];
        const commander: CardImport[] = [];
        const deck: CardImport[] = [];

        const colors = new Set<WUBRG>();
        const tags = data.deckTags;
        const related_card_names = [];

        const deck_categories = new Set(
            data.categories
                .filter((c) => c.includedInDeck)
                .map((c) => c.name.toLowerCase()),
        );

        deck_categories.delete("commander");
        deck_categories.delete("sideboard");
        function addColor({
            card: {
                oracleCard: { colorIdentity },
            },
        }: IArchidektDeckCard) {
            for (const color of colorIdentity) {
                if (color === "Blue") {
                    colors.add("U");
                    continue;
                }
                const color_char = color[0] as WUBRG;
                colors.add(color_char);
            }
        }

        for (const card of data.cards) {
            if (card.categories.length == 0) {
                deck.push({
                    str: card.card.uid,
                    amount: card.quantity,
                });
                addColor(card);
                continue;
            }
            if (card.categories.some((c) => c.toLowerCase() === "sideboard")) {
                sideboard.push({
                    str: card.card.uid,
                    amount: card.quantity,
                });
                addColor(card);
                continue;
            }
            if (card.categories.some((c) => c.toLowerCase() === "commander")) {
                commander.push({
                    str: card.card.uid,
                    amount: card.quantity,
                });
                addColor(card);
                related_card_names.push(
                    card.card.oracleCard.name.toLowerCase(),
                );
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
                addColor(card);
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
                face_card: {
                    image: data.featured,
                },
                colors: sortWUBRG(Array.from(colors)),
                tags,
                related_card_names,
            },
        };
    } catch (e) {
        console.error(e);
    }
    return null;
}
