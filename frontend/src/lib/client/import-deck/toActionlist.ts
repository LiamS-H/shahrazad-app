import {
    CardImport,
    ShahrazadAction,
    ShahrazadActionCase,
} from "@/types/bindings/action";
import { ShahrazadGameSettings } from "@/types/bindings/game";
import { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import { ShahrazadZoneId } from "@/types/bindings/zone";

export interface IParsedDeck {
    sideboard: CardImport[];
    deck: CardImport[];
}
export interface IImportOptions {
    deckId: ShahrazadZoneId;
    sideboardId: ShahrazadZoneId;
    playerId: ShahrazadPlaymatId;
    settings: ShahrazadGameSettings;
}

export function toActionList(
    { sideboard, deck }: IParsedDeck,
    { deckId, sideboardId, playerId, settings }: IImportOptions
): ShahrazadAction[] | null {
    const importActions: ShahrazadAction[] = [];

    if (sideboard.length === 0 && deck.length === 0) {
        return null;
    }

    const state = settings.commander
        ? {}
        : { revealed: [playerId], face_down: true };

    if (sideboard.length > 0) {
        importActions.push({
            type: ShahrazadActionCase.ZoneImport,
            cards: sideboard,
            zone: sideboardId,
            player_id: playerId,
            token: false,
            state,
        });
    }
    importActions.push({
        type: ShahrazadActionCase.ZoneImport,
        cards: deck,
        zone: deckId,
        player_id: playerId,
        token: false,
        state: {
            revealed: [playerId],
            face_down: true,
        },
    });

    return importActions;
}
