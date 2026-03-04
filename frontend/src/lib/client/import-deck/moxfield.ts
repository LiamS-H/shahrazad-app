"use server";

import { CardImport } from "@/types/bindings/action";
import { IUrlImport } from "./importFromUrl";
import { WUBRG } from "@/types/interfaces/color";
import { sortWUBRG } from "@/lib/utils/sort-wubrg";

type IMoxfiledColors = ("W" | "U" | "B" | "R" | "G")[]; // empty is colorless

interface IMoxfieldCard {
    scryfall_id: string;
    color_identity: IMoxfiledColors;
    colors: IMoxfiledColors;
    name: string;
}

interface IMoxfieldZoneCard {
    card: IMoxfieldCard;
    quantity: number;
}

interface IMoxfieldCardZone {
    [key: string]: IMoxfieldZoneCard;
}

interface IMoxfieldResponse {
    name: string;
    description: string;
    format: string;
    createdByUser: {
        userName: string;
        displayName: string;
    };
    main: IMoxfieldCard;
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
        const colors = new Set<WUBRG>();
        const isCommander = Object.values(data.commanders).length !== 0;
        const tags: string[] = [];
        const related_card_names = [];

        function addColor({ card }: IMoxfieldZoneCard) {
            const included = isCommander ? card.color_identity : card.colors;
            for (const color of included) {
                colors.add(color);
            }
        }

        for (const card of Object.values(data.commanders)) {
            commander.push({
                str: card.card.scryfall_id,
            });
            related_card_names.push(card.card.name.toLowerCase());
            addColor(card);
        }
        for (const card of Object.values(data.sideboard)) {
            sideboard.push({
                str: card.card.scryfall_id,
                amount: card.quantity,
            });
            addColor(card);
        }
        for (const card of Object.values(data.mainboard)) {
            deck.push({
                str: card.card.scryfall_id,
                amount: card.quantity,
            });
            addColor(card);
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
                face_card: {
                    id: data.main.scryfall_id,
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
