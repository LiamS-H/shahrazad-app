import { ShahrazadZoneId } from './zone';
export type ShahrazadPlaymat = { library: ShahrazadZoneId;
    hand: ShahrazadZoneId; graveyard: ShahrazadZoneId;
    battlefield: ShahrazadZoneId; exile: ShahrazadZoneId;
    command: ShahrazadZoneId; life: number; mulligans: number };
export type ShahrazadPlaymatId = string;
