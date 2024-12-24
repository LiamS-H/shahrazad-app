import { ShahrazadCard, ShahrazadCardId } from './card';
import { ShahrazadPlaymat } from './playmat';
import { ShahrazadZone, ShahrazadZoneId } from './zone';
export type ShahrazadGame = { zone_count: number; card_count: number;
    cards: { [key: ShahrazadCardId]: ShahrazadCard };
    zones: { [key: ShahrazadZoneId]: ShahrazadZone };
    playmats: Array<ShahrazadPlaymat> };
