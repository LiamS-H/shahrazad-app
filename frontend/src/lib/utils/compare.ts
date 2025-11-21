import { ShahrazadCard } from "@/types/bindings/card";
import { ShahrazadPlaymat } from "@/types/bindings/playmat";
import { ShahrazadZone } from "@/types/bindings/zone";

/**
 * returns true if playmats are equal
 */
export function comparePlaymats(
    playmat1: ShahrazadPlaymat,
    playmat2: ShahrazadPlaymat
): boolean {
    if (playmat1.library !== playmat2.library) return false;
    if (playmat1.hand !== playmat2.hand) return false;
    if (playmat1.graveyard !== playmat2.graveyard) return false;
    if (playmat1.battlefield !== playmat2.battlefield) return false;
    if (playmat1.exile !== playmat2.exile) return false;
    if (playmat1.command !== playmat2.command) return false;
    if (playmat1.sideboard !== playmat2.sideboard) return false;
    if (playmat1.life !== playmat2.life) return false;
    if (playmat1.mulligans !== playmat2.mulligans) return false;
    if (playmat1.player.display_name !== playmat2.player.display_name)
        return false;

    const cd1 = playmat1.command_damage;
    const cd2 = playmat2.command_damage;
    const cd1Keys = Object.keys(cd1);
    const cd2Keys = Object.keys(cd2);

    if (cd1Keys.length !== cd2Keys.length) return false;

    for (const key of cd1Keys) {
        if (!Object.hasOwn(cd2, key) || cd1[key] !== cd2[key]) {
            return false;
        }
    }

    return true;
}

/**
 * returns true if zones are equal
 */
export function compareZones(
    zone1: ShahrazadZone,
    zone2: ShahrazadZone
): boolean {
    if (!compareList(zone1.cards, zone2.cards)) return false;

    return true;
}

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
