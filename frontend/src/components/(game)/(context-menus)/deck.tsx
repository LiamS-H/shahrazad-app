import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    // ContextMenuRadioGroup,
    // ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/(ui)/context-menu";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { type ReactNode, useState } from "react";
import { randomU64 } from "@/lib/utils/random";
import { usePlayer } from "@/contexts/(game)/player";
import { useSearchContext } from "@/contexts/(game)/search";
import { DrawTo } from "./(menu-items)/draw-to";
import { KeyShortcut } from "@/components/(ui)/key-shortcut";

export default function DeckContextMenu({
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
    const deck = getZone(zoneId);

    return (
        <ContextMenu modal={contextOpen} onOpenChange={setContextOpen}>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuLabel>Deck ({deck.cards.length})</ContextMenuLabel>
                <ContextMenuSeparator />
                <ContextMenuItem
                    disabled={deck.cards.length === 0}
                    onClick={() => {
                        applyAction({
                            type: ShahrazadActionCase.Shuffle,
                            zone: zoneId,
                            seed: randomU64(),
                        });
                    }}
                >
                    Shuffle
                    <ContextMenuShortcut>
                        <KeyShortcut keys={["Ctrl", "S"]} />
                    </ContextMenuShortcut>
                </ContextMenuItem>

                <ContextMenuItem
                    disabled={deck.cards.length === 0}
                    onClick={() => {
                        search(zoneId);
                    }}
                >
                    Search
                    <ContextMenuShortcut>
                        <KeyShortcut keys={["Ctrl", "F"]} />
                    </ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem
                    disabled={deck.cards.length === 0}
                    onClick={() => {
                        applyAction({
                            type: ShahrazadActionCase.DrawTop,
                            amount: 1,
                            destination: playmat.hand,
                            source: playmat.library,
                            state: {
                                face_down: true,
                                revealed: [player],
                            },
                        });
                    }}
                >
                    Draw
                    <ContextMenuShortcut>
                        <KeyShortcut keys={["Ctrl", "D"]} />
                    </ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSub>
                    <ContextMenuSubTrigger disabled={deck.cards.length === 0}>
                        Draw to
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                        <DrawTo
                            label="Graveyard"
                            destination={playmat.graveyard}
                            source={zoneId}
                        />
                        <DrawTo
                            label="Exile"
                            destination={playmat.exile}
                            source={zoneId}
                        />
                        <DrawTo
                            label="Hand"
                            destination={playmat.hand}
                            source={zoneId}
                            state={{ revealed: [player] }}
                        />
                    </ContextMenuSubContent>
                </ContextMenuSub>
            </ContextMenuContent>
        </ContextMenu>
    );
}
