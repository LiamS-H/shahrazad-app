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
import { useSelection } from "@/contexts/selection";
export default function BoardCardContextMenu({
    cardId,
    children,
}: {
    cardId: string;
    children: ReactNode;
}) {
    const { applyAction, getCard } = useShahrazadGameContext();
    const { selectedCards } = useSelection();
    const shah_card = getCard(cardId);
    const [open, setOpen] = useState(true);
    const cards = selectedCards.includes(cardId) ? selectedCards : [cardId];

    return (
        <ContextMenu modal={open} onOpenChange={setOpen}>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuLabel>
                    {cards.length === 1
                        ? shah_card.card_name
                        : `${cards.length} cards`}
                </ContextMenuLabel>
                <ContextMenuSeparator />
                {(!shah_card.state.tapped || cards.length > 1) && (
                    <ContextMenuItem
                        onClick={() => {
                            applyAction({
                                type: ShahrazadActionCase.CardState,
                                cards,
                                state: {
                                    tapped: true,
                                },
                            });
                        }}
                    >
                        Tap
                    </ContextMenuItem>
                )}
                {(shah_card.state.tapped || cards.length > 1) && (
                    <ContextMenuItem
                        onClick={() => {
                            applyAction({
                                type: ShahrazadActionCase.CardState,
                                cards,
                                state: {
                                    tapped: false,
                                },
                            });
                        }}
                    >
                        Untap
                    </ContextMenuItem>
                )}
                {(!shah_card.state.face_down || cards.length > 1) && (
                    <ContextMenuItem
                        onClick={() => {
                            applyAction({
                                type: ShahrazadActionCase.CardState,
                                cards,
                                state: {
                                    face_down: true,
                                },
                            });
                        }}
                    >
                        Turn facedown
                    </ContextMenuItem>
                )}
                {(shah_card.state.face_down || cards.length > 1) && (
                    <ContextMenuItem
                        onClick={() => {
                            applyAction({
                                type: ShahrazadActionCase.CardState,
                                cards,
                                state: {
                                    face_down: false,
                                },
                            });
                        }}
                    >
                        Turn faceup
                    </ContextMenuItem>
                )}
                {cards.length === 1 && (
                    <>
                        <ContextMenuItem
                            onClick={() => {
                                applyAction({
                                    type: ShahrazadActionCase.CardState,
                                    cards,
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
                                    cards,
                                    state: {
                                        counters:
                                            shah_card.state.counters || [],
                                    },
                                });
                            }}
                        >
                            Remove counter
                        </ContextMenuItem>
                    </>
                )}
            </ContextMenuContent>
        </ContextMenu>
    );
}
