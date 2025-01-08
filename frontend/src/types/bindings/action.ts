import { ShahrazadCardId, ShahrazadCardOptions } from './card';
import { ShahrazadPlaymatId } from './playmat';
import { ShahrazadZoneId } from './zone';
type usize = number;

export enum ShahrazadActionCase {
    DrawBottom = 'DrawBottom',
    DrawTop = 'DrawTop',
    CardState = 'CardState',
    CardZone = 'CardZone',
    Shuffle = 'Shuffle',
    ZoneImport = 'ZoneImport',
    DeckImport = 'DeckImport',
    AddPlayer = 'AddPlayer',
    SetLife = 'SetLife',
}

export type ShahrazadActionCaseDrawBottom = {
    type: ShahrazadActionCase.DrawBottom;
    amount: usize;
    source: ShahrazadZoneId;
    destination: ShahrazadZoneId;
};

export type ShahrazadActionCaseDrawTop = {
    type: ShahrazadActionCase.DrawTop;
    amount: usize;
    source: ShahrazadZoneId;
    destination: ShahrazadZoneId;
};

export type ShahrazadActionCaseCardState = {
    type: ShahrazadActionCase.CardState;
    cards: Array<ShahrazadCardId>;
    state: ShahrazadCardOptions;
};

export type ShahrazadActionCaseCardZone = {
    type: ShahrazadActionCase.CardZone;
    cards: Array<ShahrazadCardId>;
    state: ShahrazadCardOptions;
    source: ShahrazadZoneId;
    destination: ShahrazadZoneId;
    index: number;
};

export type ShahrazadActionCaseShuffle = {
    type: ShahrazadActionCase.Shuffle;
    zone: ShahrazadZoneId;
    seed: string;
};

export type ShahrazadActionCaseZoneImport = {
    type: ShahrazadActionCase.ZoneImport;
    zone: ShahrazadZoneId;
    cards: Array<string>;
};

export type ShahrazadActionCaseDeckImport = {
    type: ShahrazadActionCase.DeckImport;
    deck_uri: string;
    player_idx: number;
};

export type ShahrazadActionCaseAddPlayer = {
    type: ShahrazadActionCase.AddPlayer;
    player_id: string;
};

export type ShahrazadActionCaseSetLife = {
    type: ShahrazadActionCase.SetLife;
    player_id: ShahrazadPlaymatId;
    life: number;
};

export type ShahrazadAction =
    | ShahrazadActionCaseDrawBottom
    | ShahrazadActionCaseDrawTop
    | ShahrazadActionCaseCardState
    | ShahrazadActionCaseCardZone
    | ShahrazadActionCaseShuffle
    | ShahrazadActionCaseZoneImport
    | ShahrazadActionCaseDeckImport
    | ShahrazadActionCaseAddPlayer
    | ShahrazadActionCaseSetLife;
