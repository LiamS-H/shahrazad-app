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
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useShahrazadGameContext } from "../../../contexts/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { type ReactNode, useState } from "react";
import { randomU64 } from "@/lib/random";
import { usePlayer } from "@/contexts/player";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerTitle,
} from "@/components/(ui)/drawer";
import HorizontalZone from "../horizontal-zone";
export default function DeckContextMenu({
    zoneId,
    children,
}: {
    zoneId: string;
    children: ReactNode;
}) {
    const player = usePlayer();
    const { applyAction, getPlaymat, getZone } = useShahrazadGameContext();
    const playmat = getPlaymat(player);
    const [contextOpen, setContextOpen] = useState(true);
    const [searchOpen, setSearchOpen] = useState(false);
    const deck = getZone(zoneId);

    return (
        <>
            <Drawer
                open={searchOpen && deck.cards.length !== 0}
                onOpenChange={(open) => {
                    setSearchOpen(open);
                    if (!open) {
                        setContextOpen(false);
                    }
                }}
            >
                <DrawerContent>
                    <VisuallyHidden>
                        <DrawerTitle>Searching</DrawerTitle>
                        <DrawerDescription>
                            Drag items into play
                        </DrawerDescription>
                    </VisuallyHidden>
                    <HorizontalZone id={zoneId} />
                </DrawerContent>
            </Drawer>
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
                            setSearchOpen(true);
                        }}
                    >
                        Search
                        <ContextMenuShortcut>⌘F</ContextMenuShortcut>
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        </>
    );
}
