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

function Content({
    zoneId,
    onPopOut,
}: {
    zoneId: ShahrazadZoneId;
    onPopOut?: () => void;
}) {
    const { player } = usePlayer();
    const { applyAction, getPlaymat } = useShahrazadGameContext();
    const { search } = useSearchContext();
    const playmat = getPlaymat(player);
    const graveyard = useZone(zoneId);
    return (
        <>
            <ContextMenuLabel>
                Graveyard ({graveyard.cards.length})
            </ContextMenuLabel>
            <ContextMenuSeparator />
            {onPopOut && (
                <ContextMenuItem onClick={onPopOut}>Pop out</ContextMenuItem>
            )}
            <ContextMenuItem
                disabled={graveyard.cards.length === 0}
                onClick={() => {
                    search(zoneId);
                }}
            >
                Search
            </ContextMenuItem>
            <ContextMenuSub>
                <ContextMenuSubTrigger disabled={graveyard.cards.length === 0}>
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
        </>
    );
}

export default function GraveyardContextMenu({
    zoneId,
    cardId,
    children,
    onPopOut,
}: {
    zoneId: ShahrazadZoneId;
    cardId: ShahrazadCardId;
    children: ReactNode;
    onPopOut?: () => void;
}) {
    return (
        <ContextMenu modal>
            <ContextMenuTrigger cardId={cardId} zoneId={zoneId}>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent>
                <Content zoneId={zoneId} onPopOut={onPopOut} />
            </ContextMenuContent>
        </ContextMenu>
    );
}
