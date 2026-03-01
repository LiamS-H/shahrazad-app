import { ShahrazadCardId } from './card';
type usize = number;
export type ShahrazadZone = { cards: Array<ShahrazadCardId>; name: ZoneName };
export type ShahrazadZoneId = usize;
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
