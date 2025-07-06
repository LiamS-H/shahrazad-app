import { ShahrazadCard } from "@/types/bindings/card";

/**
 * returns true if cards are equal
 */
export function compareCards(
    card1: ShahrazadCard,
    card2: ShahrazadCard
): boolean {
    if (card1.card_name !== card2.card_name) return false;
    if (card1.commander !== card2.commander) return false;
    if (card1.location !== card2.location) return false;
    if (card1.owner !== card2.owner) return false;
    if (card1.token !== card2.token) return false;
    const state1 = card1.state;
    const state2 = card2.state;
    if ((state1.annotation ?? "") != (state2.annotation ?? "")) return false;
    if (state1.face_down !== state2.face_down) return false;
    if ((state1.flipped ?? false) !== (state2.flipped ?? false)) return false;
    if ((state1.inverted ?? false) !== (state2.inverted ?? false)) return false;
    if ((state1.tapped ?? false) !== (state2.tapped ?? false)) return false;
    if (state1.x !== state2.x) return false;
    if (state1.y !== state2.y) return false;
    if (!compareList(state1.revealed ?? [], state2.revealed ?? []))
        return false;
    const counters1 = state1.counters ?? [];
    const counters2 = state2.counters ?? [];
    if (counters1.length !== counters2.length) {
        return false;
    }
    for (const i in counters1) {
        if (counters1[i].amount !== counters2[i].amount) {
            return false;
        }
    }

    return true;
}

/**
 * returns true if lists are equal
 */
export function compareList<T>(list1: T[], list2: T[]) {
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
