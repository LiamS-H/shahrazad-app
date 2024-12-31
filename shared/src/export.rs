use type_reflect::*;

use crate::types::{
    action::ShahrazadAction,
    card::{ShahrazadCard, ShahrazadCardId, ShahrazadCardName, ShahrazadCardOptions},
    game::{ShahrazadGame, ShahrazadPlaymat, ShahrazadPlaymatId},
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
                import {ShahrazadCardId,ShahrazadCardOptions} from './card';\
                import {ShahrazadZoneId} from './zone';

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
                import {ShahrazadCardId,ShahrazadCard} from './card';\
                import {ShahrazadZoneId,ShahrazadZone} from './zone';\
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
}
