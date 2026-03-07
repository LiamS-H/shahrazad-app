"use client";
import { IDeckData } from "../client/import-deck/importFromUrl";

const SAVED_DECKS_KEY = "saved-decks";

export interface ISavedDeck {
    url: string;
    deck: IDeckData;
    lastUsed: string;
}

type SavedDecks = Map<string, ISavedDeck>;

let saved_decks: SavedDecks | null = null;

export function getSavedDecks(): SavedDecks {
    if (saved_decks !== null) return saved_decks;
    const saved = localStorage.getItem(SAVED_DECKS_KEY);
    if (saved === null) {
        saved_decks = new Map();
        return saved_decks;
    }
    try {
        saved_decks = new Map(Object.entries(JSON.parse(saved)));
    } catch (e) {
        console.error(e);
    }
    if (!(saved_decks instanceof Map)) {
        saved_decks = new Map();
        localStorage.setItem(
            SAVED_DECKS_KEY,
            JSON.stringify(Object.fromEntries(saved_decks.entries())),
        );
        return saved_decks;
    }
    return saved_decks;
}

export function saveDeck(url: string, deck: IDeckData) {
    const decks = getSavedDecks();
    decks.set(url, { deck, url, lastUsed: new Date().toISOString() });
    if (decks.size > 20) {
        const entries = [...decks.entries()];
        entries.sort(([, { lastUsed: a }], [, { lastUsed: b }]) =>
            a > b ? -1 : 1,
        );
        const removed = entries.slice(21);
        for (const [key] of removed) {
            decks.delete(key);
        }
    }

    const string = JSON.stringify(Object.fromEntries(decks.entries()));
    localStorage.setItem(SAVED_DECKS_KEY, string);
}

export function deleteDeck(url: string) {
    const decks = getSavedDecks();
    decks.delete(url);
    const string = JSON.stringify(Object.fromEntries(decks.entries()));
    localStorage.setItem(SAVED_DECKS_KEY, string);
}

// export function useSavedDeck(url: string) {
//     const decks = getSavedDecks();
//     const deck = decks.get(url);
//     if (!deck) {
//         console.error("[db] couldn't find deck");
//         return;
//     }
//     deck.lastUsed = new Date().toISOString();
//     localStorage.setItem(SAVED_DECKS_KEY, JSON.stringify(decks));
// }
