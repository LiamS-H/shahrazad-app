import { ShahrazadGame } from "../interfaces/game";
import { ShahrazadAction } from "../interfaces/action";
import { ShahrazadZoneId } from "../interfaces/zone";
import { ShahrazadPlaymat } from "../interfaces/playmat";
import { compareCards, compareList } from "../../utils/compare";

export type GameMoveApplier = (move: ShahrazadAction.ANY) => void;
// TO DO: Remove side effects :( create copies when modifying such as in card Zone.
export function applyMove(
    game: ShahrazadGame,
    move: ShahrazadAction.ANY
): ShahrazadGame | null {
    console.log("applying move:", move);
    switch (move.type) {
        case "IMPORT":
            switch (move.mode) {
                case "DECK":
                    for (const card_name of move.cards) {
                        game.cardCount += 1;
                        const card_id = `CARD_${game.cardCount}`;
                        game.cards[card_id] = {
                            card_name: card_name,
                            location: move.deck,
                            face_down: true,
                            x: null,
                            y: null,
                        };
                        game.zones[move.deck].cards.push(card_id);
                    }
                    return game;
            }
        case "ADD_PLAYER":
            const new_playmat: ShahrazadPlaymat = {
                battlefield: `ZONE_${game.zoneCount + 1}` as ShahrazadZoneId,
                hand: `ZONE_${game.zoneCount + 2}` as ShahrazadZoneId,
                library: `ZONE_${game.zoneCount + 3}` as ShahrazadZoneId,
                graveyard: `ZONE_${game.zoneCount + 4}` as ShahrazadZoneId,
                exile: `ZONE_${game.zoneCount + 5}` as ShahrazadZoneId,
                command: `ZONE_${game.zoneCount + 6}` as ShahrazadZoneId,
            };
            game.playmats.push(new_playmat);
            for (const id of Object.values(new_playmat)) {
                game.zones[id] = {
                    cards: [],
                };
            }
            game.zoneCount += 6;
            return game;
        case "DRAW":
            let source_cards;
            switch (move.mode) {
                case "BOTTOM":
                    source_cards = game.zones[move.source].cards.slice(
                        move.amount
                    );
                    game.zones[move.source].cards = game.zones[
                        move.source
                    ].cards.slice(move.amount);
                    game.zones[move.destination].cards.push(...source_cards);
                    break;
                case "TOP":
                    source_cards = game.zones[move.source].cards.slice(
                        -move.amount
                    );
                    game.zones[move.source].cards = game.zones[
                        move.source
                    ].cards.slice(0, -move.amount);
                    game.zones[move.destination].cards.push(...source_cards);
            }
            return game;
        case "CARD":
            let modified = false;
            switch (move.mode) {
                case "STATE":
                    for (const cardID of move.cards) {
                        const old_card = game.cards[cardID];
                        const new_card = { ...old_card, ...move.state };
                        if (!compareCards(old_card, new_card)) {
                            modified = true;
                        }
                        game.cards[cardID] = new_card;
                    }
                    if (!modified) return null;
                    return game;

                case "ZONE":
                    for (const cardID of move.cards) {
                        const old_card = game.cards[cardID];
                        const new_card = {
                            ...old_card,
                            ...move.state,
                            location: move.dest,
                        };
                        if (!compareCards(old_card, new_card)) {
                            modified = true;
                        }
                        game.cards[cardID] = new_card;
                    }

                    const old_cards = [...game.zones[move.dest].cards];
                    const cardsSet = new Set(move.cards);

                    game.zones[move.src].cards = game.zones[
                        move.src
                    ].cards.filter((cardID) => !cardsSet.has(cardID));
                    if (
                        game.zones[move.dest].cards.some((cardID) =>
                            cardsSet.has(cardID)
                        )
                    ) {
                        return null;
                    }
                    if (move.index == -1) {
                        move.index = game.zones[move.dest].cards.length + 1;
                    }

                    const new_cards = game.zones[move.dest].cards.toSpliced(
                        move.index,
                        0,
                        ...move.cards
                    );
                    modified = !compareList(old_cards, new_cards);
                    game.zones[move.dest].cards = new_cards;

                    if (!modified) return null;

                    return game;
            }
        case "SHUFFLE":
    }

    return game;
}
