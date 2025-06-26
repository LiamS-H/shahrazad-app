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
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { type ReactNode } from "react";
import { useSearchContext } from "@/contexts/(game)/search";
import { randomU64 } from "@/lib/utils/random";
import { ZoneName } from "@/types/bindings/zone";
export default function SearchCardContextMenu({
    zoneId,
    cardId,
    children,
}: {
    zoneId: string;
    cardId: string;
    children: ReactNode;
}) {
    const {
        applyAction,
        getPlaymat,
        getZone,
        active_player: player,
    } = useShahrazadGameContext();
    const { search } = useSearchContext();
    const playmat = getPlaymat(player);
    const zone = getZone(zoneId);

    return (
        <ContextMenu modal>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuLabel> ({zone.cards.length})</ContextMenuLabel>
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
            </ContextMenuContent>
        </ContextMenu>
    );
}
