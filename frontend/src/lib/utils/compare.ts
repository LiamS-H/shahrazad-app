import { ShahrazadCard, ShahrazadCardId } from "@/types/bindings/card";

export function compareCards(card1: ShahrazadCard, card2: ShahrazadCard) {
    const keys1 = Object.keys(card1) as (keyof ShahrazadCard)[];
    const keys2 = Object.keys(card2) as (keyof ShahrazadCard)[];

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        if (card1[key] !== card2[key]) {
            return false;
        }
    }

    return true;
}

export function compareList(
    list1: ShahrazadCardId[],
    list2: ShahrazadCardId[]
) {
    if (list1.length != list2.length) {
        return false;
    }
    for (const i in list1) {
        if (list1[i] != list2[i]) {
            return false;
        }
    }
    return true;
}
