import { ShahrazadZoneId } from './zone';
export type ShahrazadPlaymat = { library: ShahrazadZoneId;
    hand: ShahrazadZoneId; graveyard: ShahrazadZoneId;
    battlefield: ShahrazadZoneId; exile: ShahrazadZoneId;
    command: ShahrazadZoneId; life: number; mulligans: number;
    player: ShahrazadPlayer };
export type ShahrazadPlaymatId = string;
export type ShahrazadPlayer = { display_name: string };
