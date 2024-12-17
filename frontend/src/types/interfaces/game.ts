import { ShahrazadCard, ShahrazadCardId } from "./card";
import { ShahrazadPlaymat } from "./playmat";
import { ShahrazadZone, ShahrazadZoneId } from "./zone";

interface ShahrazadGame {
    zoneCount: number;
    cardCount: number;
    cards: Record<ShahrazadCardId, ShahrazadCard>;
    zones: Record<ShahrazadZoneId, ShahrazadZone>;
    playmats: ShahrazadPlaymat[];
}

export type { ShahrazadGame };
