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
import { RevealRandomCard, RevealToPlayers } from "./(menu-items)/reveal";
import { ShahrazadZoneId } from "@/types/bindings/zone";

function Content({ zoneId }: { zoneId: ShahrazadZoneId }) {
    const { player } = usePlayer();
    const { applyAction, getPlaymat } = useShahrazadGameContext();
    const { search } = useSearchContext();
    const playmat = getPlaymat(player);
    const hand = useZone(zoneId);
    return (
        <>
            <ContextMenuLabel>Hand ({hand.cards.length})</ContextMenuLabel>
            <ContextMenuSeparator />
            <RevealToPlayers cards={hand.cards} />
            <ContextMenuSub>
                <ContextMenuSubTrigger disabled={hand.cards.length === 0}>
                    Send to
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <ContextMenuItem
                        onClick={() => {
                            applyAction({
                                type: ShahrazadActionCase.CardZone,
                                cards: hand.cards,
                                index: -1,
                                destination: playmat.exile,
                                state: { face_down: false, revealed: [] },
                            });
                        }}
                    >
                        Exile
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={() => {
                            applyAction({
                                type: ShahrazadActionCase.CardZone,
                                cards: hand.cards,
                                index: -1,
                                destination: playmat.graveyard,
                                state: { face_down: false, revealed: [] },
                            });
                        }}
                    >
                        Graveyard
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={() => {
                            applyAction({
                                type: ShahrazadActionCase.CardZone,
                                cards: hand.cards,
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
            <ContextMenuItem
                disabled={hand.cards.length === 0}
                onClick={() => {
                    search(zoneId);
                }}
            >
                Search
            </ContextMenuItem>
            <RevealRandomCard cards={hand.cards} />
        </>
    );
}

export default function HandContextMenu({
    zoneId,
    children,
}: {
    zoneId: string;
    children: ReactNode;
}) {
    return (
        <ContextMenu modal>
            <ContextMenuTrigger cardId={zoneId}>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <Content zoneId={zoneId} />
            </ContextMenuContent>
        </ContextMenu>
    );
}
