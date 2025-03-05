import { CardImport, ShahrazadAction } from "@/types/bindings/action";
import { IImportOptions, toActionList } from "./toActionlist";

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

export function parseDeckstr(str: string): {
    sideboard: CardImport[];
    deck: CardImport[];
} | null {
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

    const deck: CardImport[] = [];
    const sideboard: CardImport[] = [];

    if (sideboard_str) {
        for (const line of sideboard_str.split("\n")) {
            const parsed = parseLine(line);
            if (parsed == null) continue;
            sideboard.push({
                str: parsed.name,
                amount: parsed.amount,
            });
        }
    }

    for (const line of deck_str.split("\n")) {
        const parsed = parseLine(line);
        if (parsed == null) continue;
        deck.push({ str: parsed.name, amount: parsed.amount });
    }
    if (deck.length === 0 && sideboard.length === 0) {
        return null;
    }
    return { deck, sideboard };
}

export function importFromStr(
    str: string,
    locations: IImportOptions
): ShahrazadAction[] | null | undefined {
    const deck = parseDeckstr(str);
    if (!deck) return undefined;
    return toActionList(deck, locations);
}
