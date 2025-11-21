import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadCardId } from "@/types/bindings/card";
import { ScryfallCard } from "@scryfall/api-types";
import { useEffect, useState } from "react";
import { useScrycardsContext } from "react-scrycards";

export type ScrycardsList = {
    id: string;
    card: ScryfallCard.Any | undefined;
}[];

// todo: make the cards update as the cards come in
export function useScrycardsList(card_ids: ShahrazadCardId[]) {
    const [cards, setCards] = useState<ScrycardsList>([]);
    const [loading, setLoading] = useState(false);
    const { getCard } = useShahrazadGameContext();
    const { requestCard } = useScrycardsContext();

    useEffect(() => {
        async function fetchCards() {
            setLoading(true);
            const promises = card_ids.map((card_id) => {
                const shah_card = getCard(card_id);
                return requestCard(shah_card.card_name);
            });

            const scrycards = await Promise.race([
                Promise.allSettled(promises),
                new Promise<PromiseSettledResult<ScryfallCard.Any>[]>(
                    (resolve) =>
                        setTimeout(() => {
                            resolve(
                                promises.map((p) => {
                                    if (!p || p instanceof Promise) {
                                        return {
                                            status: "rejected",
                                            reason: new Error(
                                                "requestCard timeout"
                                            ),
                                        };
                                    }
                                    return { status: "fulfilled", value: p };
                                })
                            );
                        }, 1000)
                ),
            ]);
            setLoading(false);
            const fetched_cards: ScrycardsList = [];
            for (let i = 0; i < scrycards.length; i++) {
                const scry_card = scrycards[i];
                const id = card_ids[i];
                if (scry_card.status === "rejected") {
                    fetched_cards.push({ id, card: undefined });
                    continue;
                }
                fetched_cards.push({ id, card: scry_card.value });
            }
            setCards(fetched_cards);
        }
        fetchCards();
    }, [card_ids, getCard, requestCard]);

    return { cards, loading };
}
