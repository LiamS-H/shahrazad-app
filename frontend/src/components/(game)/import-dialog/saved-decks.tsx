import { useShahrazadGameContext } from "@/contexts/(game)/game";
import {
    getSavedDecks,
    // deleteDeck,
    type ISavedDeck,
} from "@/lib/storage/deck-storage";
import { useMemo, useState } from "react";
import { SavedDeckCard } from "./saved-deck-card";
import { Input } from "@/components/(ui)/input";

// import { Button } from "@/components/(ui)/button";
import { Switch } from "@/components/(ui)/switch";
import { Label } from "@/components/(ui)/label";

export function SavedDecks({
    importDeck,
}: {
    importDeck: (url: string) => void;
}) {
    const { settings } = useShahrazadGameContext();
    const [search, setSearch] = useState<string | null>(null);

    const [commander, setCommander] = useState(settings.commander);

    const savedDecks = useMemo(() => {
        const savedDecks: ISavedDeck[] = [];

        const decks = getSavedDecks();
        if (typeof window == "undefined") {
            return savedDecks;
        }
        if (!("forEach" in decks)) return savedDecks;
        decks.forEach((deck) => {
            savedDecks.push(deck);
        });
        savedDecks.sort((a, b) => (a.lastUsed > b.lastUsed ? -1 : 1));
        return savedDecks;
    }, []);

    const displayedDecks = useMemo(() => {
        const displayedDecks = [];
        const terms = search?.toLowerCase()?.split(" ") ?? [];
        for (const deck of savedDecks) {
            if (commander && deck.deck.format !== "commander") {
                continue;
            }
            if (!commander && deck.deck.format === "commander") {
                continue;
            }

            if (
                terms.length !== 0 &&
                !terms.some(
                    (term) =>
                        // deck.deck.description.toLowerCase().includes(term) ||
                        deck.deck.format.toLowerCase().includes(term) ||
                        deck.deck.related_card_names.some((name) =>
                            name.includes(term),
                        ) ||
                        deck.deck.name.toLowerCase().includes(term),
                )
            ) {
                continue;
            }
            displayedDecks.push(deck);
        }
        return displayedDecks;
    }, [commander, savedDecks, search]);

    if (savedDecks.length === 0) {
        return null;
    }

    return (
        <>
            <div className="w- full">
                <Label htmlFor="saved-decks">Saved Decks</Label>
                <div id="saved-decks" className="flex items-center gap-1">
                    <Input
                        value={search ?? ""}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search 🔎︎"
                    />
                    <Switch
                        checked={commander}
                        onCheckedChange={(c) => setCommander(c)}
                        id="commander-filter"
                    ></Switch>
                    <Label htmlFor="commnader-filter">Commander</Label>
                </div>
                <div className="flex overflow-x-auto overflow-y-visible gap-1 py-1 h-30">
                    {displayedDecks.length === 0 && <span>no results</span>}
                    {displayedDecks.map((deck) => (
                        <SavedDeckCard
                            deck={deck}
                            key={deck.url}
                            onClick={() => importDeck(deck.url)}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
