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
export default function GraveyardContextMenu({
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
    const graveyard = getZone(zoneId);

    return (
        <ContextMenu modal>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuLabel>
                    Graveyard ({graveyard.cards.length})
                </ContextMenuLabel>
                <ContextMenuSeparator />

                <ContextMenuItem
                    disabled={graveyard.cards.length === 0}
                    onClick={() => {
                        search(zoneId);
                    }}
                >
                    Search
                </ContextMenuItem>
                <ContextMenuSub>
                    <ContextMenuSubTrigger
                        disabled={graveyard.cards.length === 0}
                    >
                        Send to
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                        <ContextMenuItem
                            onClick={() => {
                                applyAction({
                                    type: ShahrazadActionCase.CardZone,
                                    cards: graveyard.cards,
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
                                    cards: graveyard.cards,
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
                        <ContextMenuItem
                            onClick={() => {
                                applyAction({
                                    type: ShahrazadActionCase.CardZone,
                                    cards: graveyard.cards,
                                    index: 0,
                                    destination: playmat.library,
                                    state: {},
                                });
                            }}
                        >
                            Deck Bottom
                        </ContextMenuItem>
                        <ContextMenuItem
                            onClick={() => {
                                applyAction({
                                    type: ShahrazadActionCase.Shuffle,
                                    zone: zoneId,
                                    seed: randomU64(),
                                });
                                applyAction({
                                    type: ShahrazadActionCase.CardZone,
                                    cards: graveyard.cards,
                                    index: 0,
                                    destination: playmat.library,
                                    state: {},
                                });
                            }}
                        >
                            Deck Bottom Random Order
                        </ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>
            </ContextMenuContent>
        </ContextMenu>
    );
}
