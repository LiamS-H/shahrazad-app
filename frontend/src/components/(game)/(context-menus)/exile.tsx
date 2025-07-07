import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    // ContextMenuRadioGroup,
    // ContextMenuRadioItem,
    ContextMenuSeparator,
    // ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/(game)/(context-menus)/context-menu";
import { useShahrazadGameContext, useZone } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { type ReactNode } from "react";
import { usePlayer } from "@/contexts/(game)/player";
import { useSearchContext } from "@/contexts/(game)/search";
import { randomU64 } from "@/lib/utils/random";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { ShahrazadCardId } from "@/types/bindings/card";

export function Content({ zoneId }: { zoneId: ShahrazadZoneId }) {
    const { player } = usePlayer();
    const { applyAction, getPlaymat } = useShahrazadGameContext();
    const { search } = useSearchContext();
    const playmat = getPlaymat(player);
    const exile = useZone(zoneId);
    return (
        <>
            <ContextMenuLabel>Exile ({exile.cards.length})</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuItem
                disabled={exile.cards.length === 0}
                onClick={() => {
                    search(zoneId);
                }}
            >
                Search
            </ContextMenuItem>
            <ContextMenuSub>
                <ContextMenuSubTrigger disabled={exile.cards.length === 0}>
                    Send to
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <ContextMenuItem
                        onClick={() => {
                            applyAction({
                                type: ShahrazadActionCase.CardZone,
                                cards: exile.cards,
                                index: -1,
                                destination: playmat.graveyard,
                                state: {},
                            });
                        }}
                    >
                        Graveyard
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={() => {
                            applyAction({
                                type: ShahrazadActionCase.CardZone,
                                cards: exile.cards,
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
                </ContextMenuSubContent>
            </ContextMenuSub>
        </>
    );
}

export default function ExileContextMenu({
    zoneId,
    cardId,
    children,
}: {
    zoneId: ShahrazadZoneId;
    cardId: ShahrazadCardId;
    children: ReactNode;
}) {
    return (
        <ContextMenu>
            <ContextMenuTrigger cardId={cardId} zoneId={zoneId}>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent>
                <Content zoneId={zoneId} />
            </ContextMenuContent>
        </ContextMenu>
    );
}
