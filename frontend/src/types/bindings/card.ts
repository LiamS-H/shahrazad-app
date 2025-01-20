import { ShahrazadPlaymatId } from './playmat';
import { ShahrazadZoneId } from './zone';
export type ShahrazadCard = { state: ShahrazadCardState;
    card_name: ShahrazadCardName; location: ShahrazadZoneId;
    owner: ShahrazadPlaymatId; token: boolean };
export type ShahrazadCardId = string;
export type ShahrazadCardName = string;
export type ShahrazadCardState = { inverted?: boolean; flipped?: boolean;
    tapped?: boolean; face_down?: boolean; revealed?: Array<ShahrazadPlaymatId>;
    x?: number; y?: number; counters?: Array<ShahrazadCounter> };
export type ShahrazadCounter = { amount: number };
