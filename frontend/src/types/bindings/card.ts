import { ShahrazadZoneId } from './zone';
export type ShahrazadCard = { state: ShahrazadCardOptions;
    card_name: ShahrazadCardName; location: ShahrazadZoneId };
export type ShahrazadCardId = string;
export type ShahrazadCardName = string;
export type ShahrazadCardOptions = { inverted?: boolean; flipped?: boolean;
    tapped?: boolean; face_down?: boolean; x?: number; y?: number };
