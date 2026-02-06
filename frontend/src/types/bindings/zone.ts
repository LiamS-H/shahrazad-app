import { ShahrazadCardId } from './card';
export type ShahrazadZone = { cards: Array<ShahrazadCardId>; name: ZoneName };
export type ShahrazadZoneId = string;
export enum ZoneName {
    INVALID = 'INVALID',
    HAND = 'HAND',
    LIBRARY = 'LIBRARY',
    BATTLEFIELD = 'BATTLEFIELD',
    GRAVEYARD = 'GRAVEYARD',
    EXILE = 'EXILE',
    COMMAND = 'COMMAND',
    SIDEBOARD = 'SIDEBOARD',
    STACK = 'STACK',
}
