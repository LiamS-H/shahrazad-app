import { ShahrazadZoneId } from './zone';
type usize = number;
export type ShahrazadPlaymat = { library: ShahrazadZoneId;
    hand: ShahrazadZoneId; graveyard: ShahrazadZoneId;
    battlefield: ShahrazadZoneId; exile: ShahrazadZoneId;
    command: ShahrazadZoneId; sideboard: ShahrazadZoneId; life: number;
    mulligans: number; command_damage: Array<CommandDammage>;
    player: ShahrazadPlayer; reveal_deck_top: DeckTopReveal };
export type ShahrazadPlaymatId = number;
export type ShahrazadPlayer = { display_name: string };
export enum DeckTopReveal {
    NONE = 'NONE',
    PRIVATE = 'PRIVATE',
    PUBLIC = 'PUBLIC',
}
export type CommandDammage = { playmat: ShahrazadPlaymatId; damage: number };
