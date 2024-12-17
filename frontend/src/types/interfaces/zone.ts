import { ShahrazadCardId } from "./card";

type ShahrazadZoneId = (string & { __brand: "ShahrazadZoneId" }) | string;

interface ShahrazadZone {
    cards: ShahrazadCardId[];
}

export type { ShahrazadZone, ShahrazadZoneId };
