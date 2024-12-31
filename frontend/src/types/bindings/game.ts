import { ShahrazadCard, ShahrazadCardId } from './card';
import { ShahrazadPlaymat, ShahrazadPlaymatId } from './playmat';
import { ShahrazadZone, ShahrazadZoneId } from './zone';
export type ShahrazadGame = { zone_count: number; card_count: number;
    cards: { [key: ShahrazadCardId]: ShahrazadCard };
    zones: { [key: ShahrazadZoneId]: ShahrazadZone };
    playmats: { [key: ShahrazadPlaymatId]: ShahrazadPlaymat };
    players: Array<ShahrazadPlaymatId> };
