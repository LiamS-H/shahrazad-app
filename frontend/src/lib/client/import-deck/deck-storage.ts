"use client";
import { IDeckData } from "./importFromUrl";

const SAVED_DECKS_KEY = "saved-decks";

type SavedDecks = Record<
    string,
    {
        url: string;
        deck: IDeckData;
        lastUsed: Date;
    }
>;

let saved_decks: SavedDecks | null = null;

export function getDecks(): SavedDecks {
    if (saved_decks !== null) return saved_decks;
    const saved = localStorage.getItem(SAVED_DECKS_KEY);
    if (saved === null) {
        saved_decks = {};
        return saved_decks;
    }
    try {
        saved_decks = JSON.parse(saved);
    } catch {}
    if (saved_decks === null) {
        saved_decks = {};
        return saved_decks;
    }
    return saved_decks;
}

export function saveDeck(url: string, deck: IDeckData) {
    const decks = getDecks();
    decks[url] = { deck, url, lastUsed: new Date() };
}

export function useDeck(url: string) {
    const decks = getDecks();
    decks[url].lastUsed = new Date();
}
