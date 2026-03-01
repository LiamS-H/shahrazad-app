use type_reflect::*;

use crate::types::{
    action::{CardImport, ShahrazadAction},
    api::{
        CreateGameQuery, CreateGameResponse, FetchGameResponse, JoinGameQuery, JoinGameResponse,
    },
    card::{
        ShahrazadCard, ShahrazadCardId, ShahrazadCardName, ShahrazadCardState,
        ShahrazadCardStateTransform, ShahrazadCounter,
    },
    game::{ShahrazadGame, ShahrazadGameSettings},
    message::{ArrowType, Message},
    playmat::{CommandDammage, DeckTopReveal, ShahrazadPlayer, ShahrazadPlaymat, ShahrazadPlaymatId},
    ws::{ClientAction, ServerUpdate},
    zone::{ShahrazadZone, ShahrazadZoneId, ZoneName},
};

pub fn export_all() {
    export_types! {
        types: [
            ShahrazadAction,
            CardImport
        ],
        destinations: [
            TypeScript(
                "./bindings/action.ts"
                prefix: "import {ShahrazadCardId, ShahrazadCardStateTransform} from './card';\
                import {ShahrazadZoneId} from './zone';\
                import {ShahrazadGameSettings} from './game';\
                import { ShahrazadPlaymatId, ShahrazadPlayer, DeckTopReveal } from './playmat';\
                import { Message } from './message';\
                type usize = number;
                ",
                tab_size: 4,
            ),
        ]
    }
    .unwrap();

    export_types! {
        types: [
            ShahrazadCard,
            ShahrazadCardId,
            ShahrazadCardName,
            ShahrazadCardState,
            ShahrazadCounter,
            ShahrazadCardStateTransform
        ],
        destinations: [
            TypeScript(
                "./bindings/card.ts"
                prefix: "\
                import {ShahrazadZoneId} from './zone';\
                import {ShahrazadPlaymatId} from './playmat';\
                type usize = number;
                ",
                tab_size: 4,
            ),
        ]
    }
    .unwrap();

    export_types! {
        types: [
            ShahrazadGame,
            ShahrazadGameSettings
        ],
        destinations: [
            TypeScript(
                "./bindings/game.ts"
                prefix: "\
                import {ShahrazadCard} from './card';\
                import {ShahrazadZoneId,ShahrazadZone} from './zone';\
                import {ShahrazadPlaymat,ShahrazadPlaymatId} from './playmat';\
                type usize = number;
                ",
                tab_size: 4,
            ),
        ]
    }
    .unwrap();

    export_types! {
        types: [
            ShahrazadPlaymat,
            ShahrazadPlaymatId,
            ShahrazadPlayer,
            DeckTopReveal,
            CommandDammage
        ],
        destinations: [
            TypeScript(
                "./bindings/playmat.ts"
                prefix: "import {ShahrazadZoneId} from './zone';\
                type usize = number;
                ",
                tab_size: 4,
            ),
        ]
    }
    .unwrap();

    export_types! {
        types: [
            Message,
            ArrowType
        ],
        destinations: [
            TypeScript(
                "./bindings/message.ts"
                prefix: "type usize = number;",
                tab_size: 4,
            ),
        ]
    }
    .unwrap();

    export_types! {
        types: [
            ShahrazadZone,
            ShahrazadZoneId,
            ZoneName
        ],
        destinations: [
            TypeScript(
                "./bindings/zone.ts"
                prefix: "import {ShahrazadCardId} from './card';\
                type usize = number;
                ",
                tab_size: 4,
            ),
        ]
    }
    .unwrap();

    export_types! {
        types: [
            CreateGameQuery,
            JoinGameQuery,
            CreateGameResponse,
            JoinGameResponse,
            FetchGameResponse,
        ],
        destinations: [
            TypeScript(
                "./bindings/api.ts"
                prefix: "\
                import {ShahrazadGameSettings} from './game';\
                import {ShahrazadPlayer, ShahrazadPlaymatId} from './playmat';
                "
                tab_size: 4,
            ),
        ]
    }
    .unwrap();

    export_types! {
        types: [
            ClientAction,
            ServerUpdate
        ],
        destinations: [
            TypeScript(
                "./bindings/ws.ts"
                prefix: "\
                import {ShahrazadGame} from './game';
                import {ShahrazadAction} from './action';
                type Uuid = string;
                "
                tab_size: 4,
            ),
        ]
    }
    .unwrap();
}
