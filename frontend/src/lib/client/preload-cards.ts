import { preload } from "react-dom";
import type { useScrycardsContext } from "react-scrycards";

export async function preloadCardImages(
    cards: string[],
    requestCard: ReturnType<typeof useScrycardsContext>["requestCard"],
) {
    if (cards.length === 0) return;
    const last = cards.at(-1) as string;
    await requestCard(last);
    const images = [];
    for (const id of cards) {
        const card = requestCard(id);
        if (!card || card instanceof Promise) return;
        if ("image_uris" in card) {
            images.push(card.image_uris?.normal);
            images.push(card.image_uris?.png);
        } else if ("card_faces" in card && "image_uris" in card.card_faces[0]) {
            images.push(card.card_faces[0].image_uris?.normal);
            images.push(card.card_faces[0].image_uris?.png);
        }
    }

    for (const image of images) {
        if (!image) continue;
        preload(image, { as: "image" });
    }
}
