use type_reflect::*;

use crate::types::{
    action::ShahrazadAction,
    api::{CreateGameResponse, JoinGameQuery, JoinGameResponse},
    card::{ShahrazadCard, ShahrazadCardId, ShahrazadCardName, ShahrazadCardOptions},
    game::{ShahrazadGame, ShahrazadPlaymat, ShahrazadPlaymatId},
    ws::{ClientAction, ServerUpdate},
    zone::{ShahrazadZone, ShahrazadZoneId},
};

pub fn export_all() {
    export_types! {
        types: [
            ShahrazadAction,
        ],
        destinations: [
            TypeScript(
                "./bindings/action.ts"
                prefix: "\
                import {ShahrazadCardId,ShahrazadCardOptions} from './card';
                import {ShahrazadZoneId} from './zone';
                import { ShahrazadPlaymatId } from './playmat';
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
            ShahrazadCardOptions,
        ],
        destinations: [
            TypeScript(
                "./bindings/card.ts"
                prefix: "import {ShahrazadZoneId} from './zone';
                ",
                tab_size: 4,
            ),
        ]
    }
    .unwrap();

    export_types! {
        types: [
            ShahrazadGame,
        ],
        destinations: [
            TypeScript(
                "./bindings/game.ts"
                prefix: "\
                import {ShahrazadCardId,ShahrazadCard} from './card';
                import {ShahrazadZoneId,ShahrazadZone} from './zone';
                import {ShahrazadPlaymat,ShahrazadPlaymatId} from './playmat';
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
        ],
        destinations: [
            TypeScript(
                "./bindings/playmat.ts"
                prefix: "import {ShahrazadZoneId} from './zone';
                ",
                tab_size: 4,
            ),
        ]
    }
    .unwrap();

    export_types! {
        types: [
            ShahrazadZone,
            ShahrazadZoneId,
        ],
        destinations: [
            TypeScript(
                "./bindings/zone.ts"
                prefix: "import {ShahrazadCardId} from './card';
                ",
                tab_size: 4,
            ),
        ]
    }
    .unwrap();

    export_types! {
        types: [
            JoinGameQuery,
            CreateGameResponse,
            JoinGameResponse
        ],
        destinations: [
            TypeScript(
                "./bindings/api.ts"
                prefix: "import {ShahrazadGame} from './game';
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
                prefix: "import {ShahrazadGame} from './game';
                import {ShahrazadAction} from './action';
                type Uuid = string;
                "
                tab_size: 4,
            ),
        ]
    }
    .unwrap();
}
