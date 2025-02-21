import { ShahrazadAction, ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import { ShahrazadZoneId } from "@/types/bindings/zone";

function parseLine(str: string): {
    amount: number;
    name: string;
    set?: string;
    collector?: number;
    foil?: boolean;
} | null {
    const match = str.match(/^(\d+) (.*?)(?: \((\w+)\))? ?(\d+)? ?(\*F\*)?$/);
    if (!match) return null;
    const [amount_str, name, set, collector_str, foil_str] = match.slice(1);
    const amount = Number(amount_str);
    if (!amount) return null;
    const collector = Number(collector_str) || undefined;

    return {
        amount,
        name,
        set,
        collector,
        foil: foil_str == "*F*",
    };
}

export function importFromStr(
    str: string,
    deckId: ShahrazadZoneId,
    sideboardId: ShahrazadZoneId,
    playerId: ShahrazadPlaymatId
): ShahrazadAction[] | null {
    const importActions: ShahrazadAction[] = [];
    const card_groups = str.split("\n\n");

    let deck_str = "";
    let sideboard_str;
    if (card_groups.length == 1) {
        deck_str = card_groups[0];
    }
    if (card_groups.length == 2) {
        deck_str = card_groups[0];
        sideboard_str = card_groups[1];
    }

    const deck = [];
    const sideboard = [];

    if (sideboard_str) {
        for (const line of sideboard_str.split("\n")) {
            const parsed = parseLine(line);
            if (parsed == null) continue;
            for (let i = 0; i < parsed.amount; i++) {
                sideboard.push(parsed.name);
            }
        }
    }

    for (const line of deck_str.split("\n")) {
        const parsed = parseLine(line);
        if (parsed == null) continue;
        for (let i = 0; i < parsed.amount; i++) {
            deck.push(parsed.name);
        }
    }
    if (deck.length === 0 && sideboard.length === 0) {
        return null;
    }

    if (sideboard.length > 0) {
        importActions.push({
            type: ShahrazadActionCase.ZoneImport,
            cards: sideboard,
            zone: sideboardId,
            player_id: playerId,
        });
    }
    importActions.push({
        type: ShahrazadActionCase.ZoneImport,
        cards: deck,
        zone: deckId,
        player_id: playerId,
    });

    return importActions;
}
