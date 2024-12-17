import { ShahrazadCardOptions, ShahrazadCardId } from "./card";
import { ShahrazadZoneId } from "./zone";

// Actions:
//   Drawind a card (or multiple):

namespace ShahrazadAction {
    export interface BASE_ACTION {
        type: string;
    }
    export type ANY = DRAW | CARD | SHUFFLE | IMPORT | ADD_PLAYER;

    export type DRAW = DRAW_BOTTOM | DRAW_TOP;
    export interface BASE_DRAW extends BASE_ACTION {
        type: "DRAW";
        amount: number;
        source: ShahrazadZoneId;
        destination: ShahrazadZoneId;
    }
    export interface DRAW_BOTTOM extends BASE_DRAW {
        mode: "BOTTOM";
    }
    export interface DRAW_TOP extends BASE_DRAW {
        mode: "TOP";
    }

    export type CARD = CARD_STATE | CARD_ZONE;
    export interface CARD_BASE {
        type: "CARD";
        cards: ShahrazadCardId[];
        state: Partial<ShahrazadCardOptions>;
    }
    export interface CARD_STATE extends CARD_BASE {
        mode: "STATE";
    }
    export interface CARD_ZONE extends CARD_BASE {
        mode: "ZONE";
        src: ShahrazadZoneId;
        dest: ShahrazadZoneId;
        index: number;
    }

    export interface SHUFFLE extends BASE_ACTION {
        type: "SHUFFLE";
        zone: ShahrazadZoneId;
    }

    export type IMPORT = ZONE_IMPORT | GAME_IMPORT;
    export interface BASE_IMPORT extends BASE_ACTION {
        type: "IMPORT";
    }
    export interface ZONE_IMPORT extends BASE_IMPORT {
        mode: "DECK";
        deck: ShahrazadZoneId;
        cards: string[];
    }
    export interface GAME_IMPORT extends BASE_IMPORT {
        mode: "GAME";
    }

    export interface ADD_PLAYER extends BASE_ACTION {
        type: "ADD_PLAYER";
    }
}

export type { ShahrazadAction };
