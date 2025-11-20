import { ShahrazadCardId, ShahrazadCardStateTransform } from './card';
import { Message } from './message';
import { ShahrazadPlayer, ShahrazadPlaymatId } from './playmat';
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
    SetPlayer = 'SetPlayer',
    AddPlayer = 'AddPlayer',
    SetLife = 'SetLife',
    SetCommand = 'SetCommand',
    SetPlaymat = 'SetPlaymat',
    ClearBoard = 'ClearBoard',
    DeleteToken = 'DeleteToken',
    Mulligan = 'Mulligan',
    SendMessage = 'SendMessage',
    GameTerminated = 'GameTerminated',
}

export type ShahrazadActionCaseDrawBottom = {
    type: ShahrazadActionCase.DrawBottom;
    amount: usize;
    source: ShahrazadZoneId;
    destination: ShahrazadZoneId;
    state: ShahrazadCardStateTransform;
};

export type ShahrazadActionCaseDrawTop = {
    type: ShahrazadActionCase.DrawTop;
    amount: usize;
    source: ShahrazadZoneId;
    destination: ShahrazadZoneId;
    state: ShahrazadCardStateTransform;
};

export type ShahrazadActionCaseCardState = {
    type: ShahrazadActionCase.CardState;
    cards: Array<ShahrazadCardId>;
    state: ShahrazadCardStateTransform;
};

export type ShahrazadActionCaseCardZone = {
    type: ShahrazadActionCase.CardZone;
    cards: Array<ShahrazadCardId>;
    state: ShahrazadCardStateTransform;
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
    cards: Array<CardImport>;
    token: boolean;
    player_id: ShahrazadPlaymatId;
    state: ShahrazadCardStateTransform;
};

export type ShahrazadActionCaseDeckImport = {
    type: ShahrazadActionCase.DeckImport;
    deck_uri: string;
    player_id: ShahrazadPlaymatId;
};

export type ShahrazadActionCaseSetPlayer = {
    type: ShahrazadActionCase.SetPlayer;
    player_id: ShahrazadPlaymatId;
    player?: ShahrazadPlayer;
};

export type ShahrazadActionCaseAddPlayer = {
    type: ShahrazadActionCase.AddPlayer;
    player_id: ShahrazadPlaymatId;
    player: ShahrazadPlayer;
};

export type ShahrazadActionCaseSetLife = {
    type: ShahrazadActionCase.SetLife;
    player_id: ShahrazadPlaymatId;
    life: number;
};

export type ShahrazadActionCaseSetCommand = {
    type: ShahrazadActionCase.SetCommand;
    player_id: ShahrazadPlaymatId;
    command_id: ShahrazadPlaymatId;
    damage: number;
};

export type ShahrazadActionCaseSetPlaymat = {
    type: ShahrazadActionCase.SetPlaymat;
    player_id: ShahrazadPlaymatId;
    reveal_deck_top: number;
};

export type ShahrazadActionCaseClearBoard = {
    type: ShahrazadActionCase.ClearBoard;
    player_id: ShahrazadPlaymatId;
};

export type ShahrazadActionCaseDeleteToken = {
    type: ShahrazadActionCase.DeleteToken;
    cards: Array<ShahrazadCardId>;
};

export type ShahrazadActionCaseMulligan = {
    type: ShahrazadActionCase.Mulligan;
    player_id: ShahrazadPlaymatId;
    seed: string;
};

export type ShahrazadActionCaseSendMessage = {
    type: ShahrazadActionCase.SendMessage;
    messages: Array<Message>;
    player_id: ShahrazadPlaymatId;
    created_at: number;
};

export type ShahrazadActionCaseGameTerminated = {
    type: ShahrazadActionCase.GameTerminated;
};

export type ShahrazadAction =
    | ShahrazadActionCaseDrawBottom
    | ShahrazadActionCaseDrawTop
    | ShahrazadActionCaseCardState
    | ShahrazadActionCaseCardZone
    | ShahrazadActionCaseShuffle
    | ShahrazadActionCaseZoneImport
    | ShahrazadActionCaseDeckImport
    | ShahrazadActionCaseSetPlayer
    | ShahrazadActionCaseAddPlayer
    | ShahrazadActionCaseSetLife
    | ShahrazadActionCaseSetCommand
    | ShahrazadActionCaseSetPlaymat
    | ShahrazadActionCaseClearBoard
    | ShahrazadActionCaseDeleteToken
    | ShahrazadActionCaseMulligan
    | ShahrazadActionCaseSendMessage
    | ShahrazadActionCaseGameTerminated;

export type CardImport = { str: string; amount?: number };
