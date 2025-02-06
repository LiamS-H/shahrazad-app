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
} from "@/components/(ui)/context-menu";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { type ReactNode } from "react";
import { usePlayer } from "@/contexts/(game)/player";
import { useSearchContext } from "@/contexts/(game)/search";
import { randomU64 } from "@/lib/utils/random";
import { RevealRandomCard, RevealToPlayers } from "./(menu-items)/reveal";
export default function HandContextMenu({
    zoneId,
    children,
}: {
    zoneId: string;
    children: ReactNode;
}) {
    const { player } = usePlayer();
    const { applyAction, getPlaymat, getZone } = useShahrazadGameContext();
    const { search } = useSearchContext();
    const playmat = getPlaymat(player);
    const hand = getZone(zoneId);

    return (
        <ContextMenu modal>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
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
            </ContextMenuContent>
        </ContextMenu>
    );
}
