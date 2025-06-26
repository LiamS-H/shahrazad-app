import {
    ContextMenu,
    // ContextMenuCheckboxItem,
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
import { useShahrazadGameContext } from "../../../contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { type ReactNode, useState } from "react";
import { usePlayer } from "@/contexts/(game)/player";
import { isFlippable, useScrycard } from "react-scrycards";
import { RevealToPlayers } from "./(menu-items)/reveal";
export default function HandCardContextMenu({
    cardId,
    children,
}: {
    cardId: string;
    children: ReactNode;
}) {
    const { player } = usePlayer();
    const { applyAction, getPlaymat, getCard } = useShahrazadGameContext();
    const playmat = getPlaymat(player);
    const shah_card = getCard(cardId);
    const scry_card = useScrycard(shah_card.card_name);
    const [open, setOpen] = useState(true);
    const title = scry_card?.name || shah_card.card_name;

    return (
        <ContextMenu modal={open} onOpenChange={setOpen}>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuLabel>{title}</ContextMenuLabel>
                <ContextMenuSeparator />
                <ContextMenuSub>
                    <RevealToPlayers
                        cards={shah_card.state.face_down ? [cardId] : []}
                    />
                    <ContextMenuSubTrigger>Send to</ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                        <ContextMenuItem
                            onClick={() => {
                                applyAction({
                                    type: ShahrazadActionCase.CardZone,
                                    cards: [cardId],
                                    destination: playmat.library,
                                    index: 0,
                                    state: {},
                                });
                            }}
                        >
                            Library bottom
                        </ContextMenuItem>
                        <ContextMenuItem
                            onClick={() => {
                                applyAction({
                                    type: ShahrazadActionCase.CardZone,
                                    cards: [cardId],
                                    destination: playmat.library,
                                    index: -1,
                                    state: {},
                                });
                            }}
                        >
                            Library top
                        </ContextMenuItem>
                        <ContextMenuItem
                            onClick={() => {
                                applyAction({
                                    type: ShahrazadActionCase.CardZone,
                                    cards: [cardId],
                                    destination: playmat.battlefield,
                                    index: -1,
                                    state: {
                                        face_down: true,
                                        revealed: [player],
                                        x: 0,
                                        y: 0,
                                    },
                                });
                            }}
                        >
                            Play face-down
                        </ContextMenuItem>
                    </ContextMenuSubContent>
                    {isFlippable(scry_card) && (
                        <ContextMenuItem
                            onClick={() => {
                                applyAction({
                                    type: ShahrazadActionCase.CardState,
                                    cards: [cardId],
                                    state: {
                                        flipped: !shah_card.state.flipped,
                                    },
                                });
                            }}
                        >
                            Flip
                        </ContextMenuItem>
                    )}
                </ContextMenuSub>
            </ContextMenuContent>
        </ContextMenu>
    );
}
