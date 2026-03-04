import {
    CardImport,
    ShahrazadAction,
    ShahrazadActionCase,
} from "@/types/bindings/action";
import { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import { ShahrazadZoneId } from "@/types/bindings/zone";

export interface IParsedDeck {
    sideboard: CardImport[];
    commander: CardImport[];
    deck: CardImport[];
}
export interface IImportOptions {
    deckId: ShahrazadZoneId;
    sideboardId: ShahrazadZoneId;
    commandId: ShahrazadZoneId;
    playerId: ShahrazadPlaymatId;
}

export function toActionList(
    { sideboard, deck, commander }: IParsedDeck,
    { deckId, sideboardId, playerId, commandId }: IImportOptions,
): ShahrazadAction[] | null {
    const importActions: ShahrazadAction[] = [];

    if (sideboard.length === 0 && deck.length === 0 && commander.length === 0) {
        return null;
    }

    if (sideboard.length > 0) {
        importActions.push({
            type: ShahrazadActionCase.ZoneImport,
            cards: sideboard,
            zone: sideboardId,
            player_id: playerId,
            token: false,
            state: {
                revealed: [playerId],
                face_down: true,
            },
        });
    }

    if (commander.length > 0) {
        importActions.push({
            type: ShahrazadActionCase.ZoneImport,
            cards: commander,
            zone: commandId,
            player_id: playerId,
            token: false,
            state: {},
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
