import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadCardId } from "@/types/bindings/card";
import { ScryfallCard } from "@scryfall/api-types";
import { useEffect, useState } from "react";
import { useScrycardsContext } from "react-scrycards";

export type ScrycardsList = {
    id: ShahrazadCardId;
    card: ScryfallCard.Any | undefined | null;
}[];

export function useScrycardsList(card_ids: ShahrazadCardId[]) {
    const [cards, setCards] = useState<ScrycardsList>([]);
    const [loading, setLoading] = useState(false);
    const { getCard } = useShahrazadGameContext();
    const { requestCard } = useScrycardsContext();

    useEffect(() => {
        let isStale = false;

        async function fetchCards() {
            setLoading(true);

            const cached: ScrycardsList = [];
            const fetched: {
                id: ShahrazadCardId;
                card: Promise<ScrycardsList[number]["card"]>;
            }[] = [];
            const promises: (typeof fetched)[number]["card"][] = [];

            for (const id of card_ids) {
                const shah_card = getCard(id);
                if (!shah_card) return;
                const card = requestCard(shah_card.card_name);
                if (card instanceof Promise) {
                    fetched.push({ card, id });
                    promises.push(card);
                } else {
                    cached.push({ card, id });
                }
            }

            const new_cards = cached;
            setCards([
                ...new_cards,
                ...fetched.map(({ id }) => ({ id, card: null })),
            ]);

            await Promise.race([
                Promise.allSettled(promises),
                new Promise((resolve) => setTimeout(resolve, 1000)),
            ]);

            if (isStale) return;

            for (const { card, id } of fetched) {
                if (card instanceof Promise) {
                    new_cards.push({ id, card: undefined });
                    continue;
                }
                new_cards.push({ card, id });
            }

            setLoading(false);
            if (new_cards.length !== cached.length) {
                setCards(new_cards);
            }
        }

        fetchCards();

        return () => {
            isStale = true;
        };
    }, [card_ids, getCard, requestCard]);

    return { cards, loading };
}

