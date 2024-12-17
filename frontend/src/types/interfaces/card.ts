import { ShahrazadZoneId } from "./zone";

type ShahrazadCardId = (string & { __brand: "ShahrazadCardId" }) | string;
type CardName = (string & { __brand: "CardName" }) | string;

interface ShahrazadCardOptions {
    inverted?: boolean;
    flipped?: boolean;
    tapped?: boolean;
    face_down?: boolean;
    x: number | null;
    y: number | null;
}

interface ShahrazadCard extends ShahrazadCardOptions {
    card_name: CardName;
    location: ShahrazadZoneId;
}

export type { ShahrazadCard, ShahrazadCardOptions, ShahrazadCardId, CardName };
