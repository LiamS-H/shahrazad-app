import { ScryfallCard } from "@scryfall/api-types";

export function getCardArt(card: ScryfallCard.Any): string | null {
    if ("image_uris" in card) {
        return card.image_uris?.art_crop ?? null;
    } else if ("card_faces" in card && "image_uris" in card.card_faces[0]) {
        return card.card_faces[0].image_uris?.art_crop ?? null;
    }
    return null;
}
