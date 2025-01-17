import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    // ContextMenuRadioGroup,
    // ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    // ContextMenuSub,
    // ContextMenuSubContent,
    // ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/(ui)/context-menu";
import { useShahrazadGameContext } from "../../../contexts/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { type ReactNode, useState } from "react";
import { randomU64 } from "@/lib/random";
import { usePlayer } from "@/contexts/player";
import { useSearchContext } from "@/contexts/search";
export default function DeckContextMenu({
    zoneId,
    children,
}: {
    zoneId: string;
    children: ReactNode;
}) {
    const player = usePlayer();
    const { applyAction, getPlaymat, getZone } = useShahrazadGameContext();
    const { search } = useSearchContext();
    const playmat = getPlaymat(player);
    const [contextOpen, setContextOpen] = useState(true);
    const deck = getZone(zoneId);

    return (
        <ContextMenu modal={contextOpen} onOpenChange={setContextOpen}>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuLabel>Deck</ContextMenuLabel>
                <ContextMenuSeparator />
                <ContextMenuItem
                    onClick={() => {
                        applyAction({
                            type: ShahrazadActionCase.Shuffle,
                            zone: zoneId,
                            seed: randomU64(),
                        });
                    }}
                >
                    Shuffle
                    <ContextMenuShortcut>⌘S</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={() => {
                        applyAction({
                            type: ShahrazadActionCase.DrawTop,
                            amount: 1,
                            destination: playmat.hand,
                            source: playmat.library,
                        });
                    }}
                >
                    Draw
                    <ContextMenuShortcut>⌘D</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem
                    disabled={deck.cards.length === 0}
                    onClick={() => {
                        applyAction({
                            type: ShahrazadActionCase.CardState,
                            cards: deck.cards,
                            state: { face_down: false },
                        });
                        search(zoneId);
                    }}
                >
                    Search
                    <ContextMenuShortcut>⌘F</ContextMenuShortcut>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
