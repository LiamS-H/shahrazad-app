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
    // ContextMenuSub,
    // ContextMenuSubContent,
    // ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useShahrazadGameContext } from "../../../contexts/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { type ReactNode, useState } from "react";
export default function BoardCardContextMenu({
    cardId,
    children,
}: {
    cardId: string;
    children: ReactNode;
}) {
    const { applyAction, getCard } = useShahrazadGameContext();
    const shah_card = getCard(cardId);
    const [open, setOpen] = useState(true);

    return (
        <ContextMenu modal={open} onOpenChange={setOpen}>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuLabel>{shah_card.card_name}</ContextMenuLabel>
                <ContextMenuSeparator />

                <ContextMenuItem
                    onClick={() => {
                        applyAction({
                            type: ShahrazadActionCase.CardState,
                            cards: [cardId],
                            state: {
                                counters: [
                                    ...(shah_card.state.counters || []),
                                    { amount: 0 },
                                ],
                            },
                        });
                    }}
                >
                    Add counter
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={() => {
                        shah_card.state.counters?.pop();
                        applyAction({
                            type: ShahrazadActionCase.CardState,
                            cards: [cardId],
                            state: {
                                counters: shah_card.state.counters || [],
                            },
                        });
                    }}
                >
                    Remove counter
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
