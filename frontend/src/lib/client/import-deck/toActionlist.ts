import {
    CardImport,
    ShahrazadAction,
    ShahrazadActionCase,
} from "@/types/bindings/action";
import { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import { ShahrazadZoneId } from "@/types/bindings/zone";

export interface IParsedDeck {
    sideboard: CardImport[];
    deck: CardImport[];
}
export interface ILocations {
    deckId: ShahrazadZoneId;
    sideboardId: ShahrazadZoneId;
    playerId: ShahrazadPlaymatId;
}

export function toActionList(
    { sideboard, deck }: IParsedDeck,
    { deckId, sideboardId, playerId }: ILocations
): ShahrazadAction[] | null {
    const importActions: ShahrazadAction[] = [];

    if (sideboard.length === 0 && deck.length === 0) {
        return null;
    }

    if (sideboard.length > 0) {
        importActions.push({
            type: ShahrazadActionCase.ZoneImport,
            cards: sideboard,
            zone: sideboardId,
            player_id: playerId,
            token: false,
        });
    }
    importActions.push({
        type: ShahrazadActionCase.ZoneImport,
        cards: deck,
        zone: deckId,
        player_id: playerId,
        token: false,
    });

    return importActions;
}
