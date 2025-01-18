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
import { useShahrazadGameContext } from "../../../contexts/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { type ReactNode, useState } from "react";
import { usePlayer } from "@/contexts/player";
export default function HandCardContextMenu({
    cardId,
    children,
}: {
    cardId: string;
    children: ReactNode;
}) {
    const player = usePlayer();
    const { applyAction, getPlaymat, getCard } = useShahrazadGameContext();
    const playmat = getPlaymat(player);
    const shah_card = getCard(cardId);
    const [open, setOpen] = useState(true);

    return (
        <ContextMenu modal={open} onOpenChange={setOpen}>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuLabel>{shah_card.card_name}</ContextMenuLabel>
                <ContextMenuSeparator />
                <ContextMenuSub>
                    <ContextMenuSubTrigger>Send to</ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                        <ContextMenuItem
                            onClick={() => {
                                applyAction({
                                    type: ShahrazadActionCase.CardZone,
                                    cards: [cardId],
                                    destination: playmat.library,
                                    source: shah_card.location,
                                    index: 0,
                                    state: { face_down: true },
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
                                    source: shah_card.location,
                                    index: -1,
                                    state: { face_down: true },
                                });
                            }}
                        >
                            Library top
                        </ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>
            </ContextMenuContent>
        </ContextMenu>
    );
}
