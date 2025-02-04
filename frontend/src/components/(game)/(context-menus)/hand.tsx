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
import { useShahrazadGameContext } from "@/contexts/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { type ReactNode, useState } from "react";
import { usePlayer } from "@/contexts/player";
import { useSearchContext } from "@/contexts/search";
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
    const [contextOpen, setContextOpen] = useState(true);
    const hand = getZone(zoneId);

    return (
        <ContextMenu modal={contextOpen} onOpenChange={setContextOpen}>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuLabel>Hand ({hand.cards.length})</ContextMenuLabel>
                <ContextMenuSeparator />
                <RevealToPlayers cards={hand.cards} />
                <RevealRandomCard cards={hand.cards} />
                <ContextMenuSub>
                    <ContextMenuSubTrigger>Send to</ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                        <ContextMenuItem
                            onClick={() => {
                                applyAction({
                                    type: ShahrazadActionCase.CardZone,
                                    cards: hand.cards,
                                    index: -1,
                                    destination: playmat.exile,
                                    state: {},
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
            </ContextMenuContent>
        </ContextMenu>
    );
}
