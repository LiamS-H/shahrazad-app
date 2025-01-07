import { ShahrazadAction, ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadZoneId } from "@/types/bindings/zone";

function parseLine(str: string): {
    amount: number;
    name: string;
    set?: string;
    collector?: number;
    foil?: boolean;
} | null {
    const match = str.match(/^(\d+) (.*?)(?: \((\w+)\))? ?(\d+)? ?(\*F\*)?$/);
    console.log(match);
    if (!match) return null;
    const [_, amount_str, name, set, collector_str, foil_str] = match;
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
    commandId: ShahrazadZoneId
): ShahrazadAction[] {
    const importActions: ShahrazadAction[] = [];
    const card_groups = str.split("\n\n");
    console.log("card_groups:", card_groups);

    let deck_str = "";
    let command_str;
    if (card_groups.length == 1) {
        deck_str = card_groups[0];
    }
    if (card_groups.length == 2) {
        deck_str = card_groups[0];
        command_str = card_groups[1];
    }

    const deck = [];
    const command = [];

    for (const line of deck_str.split("\n")) {
        const parsed = parseLine(line);
        if (parsed == null) continue;
        for (let i = 0; i < parsed.amount; i++) {
            deck.push(parsed.name);
        }
    }
    importActions.push({
        type: ShahrazadActionCase.ZoneImport,
        cards: deck,
        zone: deckId,
    });
    if (!command_str) {
        return importActions;
    }

    for (const line of command_str.split("\n")) {
        const parsed = parseLine(line);
        if (parsed == null) continue;
        for (let i = 0; i < parsed.amount; i++) {
            command.push(parsed.name);
        }
    }

    importActions.push({
        type: ShahrazadActionCase.ZoneImport,
        cards: command,
        zone: commandId,
    });

    return importActions;
}
