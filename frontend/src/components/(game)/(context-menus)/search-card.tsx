import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/(ui)/context-menu";
import { useShahrazadGameContext, useZone } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { type ReactNode } from "react";
import { useSearchContext } from "@/contexts/(game)/search";
import { randomU64 } from "@/lib/utils/random";
import { ShahrazadZoneId, ZoneName } from "@/types/bindings/zone";
import { ShahrazadCardId } from "@/types/bindings/card";
import { useScrycard } from "react-scrycards";

function Content({
    zoneId,
    cardId,
}: {
    zoneId: ShahrazadZoneId;
    cardId: ShahrazadCardId;
}) {
    const {
        applyAction,
        getPlaymat,
        getCard,
        active_player: player,
    } = useShahrazadGameContext();
    const { search } = useSearchContext();
    const playmat = getPlaymat(player);
    const zone = useZone(zoneId);
    const shah_card = getCard(cardId);
    const scry_card = useScrycard(shah_card.card_name);
    const title = scry_card?.name || shah_card.card_name;

    return (
        <>
            <ContextMenuLabel>{title}</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuSub>
                <ContextMenuSubTrigger disabled={zone.cards.length === 0}>
                    Send to
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    {zone.name !== ZoneName.EXILE && (
                        <ContextMenuItem
                            onClick={() => {
                                applyAction({
                                    type: ShahrazadActionCase.CardZone,
                                    cards: [cardId],
                                    index: -1,
                                    destination: playmat.exile,
                                    state: {
                                        face_down: false,
                                        revealed: [],
                                    },
                                });
                            }}
                        >
                            Exile
                        </ContextMenuItem>
                    )}
                    {zone.name !== ZoneName.GRAVEYARD && (
                        <ContextMenuItem
                            onClick={() => {
                                applyAction({
                                    type: ShahrazadActionCase.CardZone,
                                    cards: [cardId],
                                    index: -1,
                                    destination: playmat.graveyard,
                                    state: {
                                        face_down: false,
                                        revealed: [],
                                    },
                                });
                            }}
                        >
                            Graveyard
                        </ContextMenuItem>
                    )}
                    {zone.name !== ZoneName.HAND && (
                        <ContextMenuItem
                            onClick={() => {
                                applyAction({
                                    type: ShahrazadActionCase.CardZone,
                                    cards: [cardId],
                                    index: -1,
                                    destination: playmat.hand,
                                    state: {
                                        face_down: true,
                                        revealed: [player],
                                    },
                                });
                            }}
                        >
                            Hand (secret)
                        </ContextMenuItem>
                    )}
                    {zone.name !== ZoneName.HAND && (
                        <ContextMenuItem
                            onClick={() => {
                                applyAction({
                                    type: ShahrazadActionCase.CardZone,
                                    cards: [cardId],
                                    index: -1,
                                    destination: playmat.hand,
                                    state: {
                                        face_down: false,
                                        revealed: [],
                                    },
                                });
                            }}
                        >
                            Hand (revealed)
                        </ContextMenuItem>
                    )}
                    {zone.name !== ZoneName.LIBRARY && (
                        <ContextMenuItem
                            onClick={() => {
                                applyAction({
                                    type: ShahrazadActionCase.CardZone,
                                    cards: [cardId],
                                    index: 0,
                                    destination: playmat.library,
                                    state: {},
                                });
                                applyAction({
                                    type: ShahrazadActionCase.Shuffle,
                                    zone: playmat.library,
                                    seed: randomU64(),
                                });
                            }}
                        >
                            Deck Shuffled
                        </ContextMenuItem>
                    )}
                </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem
                disabled={zone.cards.length === 0}
                onClick={() => {
                    search(zoneId);
                }}
            >
                Search
            </ContextMenuItem>
        </>
    );
}

export default function SearchCardContextMenu({
    zoneId,
    cardId,
    children,
}: {
    zoneId: string;
    cardId: string;
    children: ReactNode;
}) {
    return (
        <ContextMenu modal>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <Content cardId={cardId} zoneId={zoneId} />
            </ContextMenuContent>
        </ContextMenu>
    );
}
