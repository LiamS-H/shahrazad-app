import {
    ContextMenu,
    // ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    // ContextMenuRadioGroup,
    // ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubTrigger,
    // ContextMenuShortcut,
    // ContextMenuSub,
    // ContextMenuSubContent,
    // ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/(ui)/context-menu";
import { useShahrazadGameContext } from "../../../contexts/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { type ReactNode, useState } from "react";
import { useSelection } from "@/contexts/selection";
import { isFlippable, useScrycard } from "react-scrycards";
import { usePlayer } from "@/contexts/player";
import { ContextMenuSubContent } from "@radix-ui/react-context-menu";
export default function BoardCardContextMenu({
    cardId,
    children,
}: {
    cardId: string;
    children: ReactNode;
}) {
    const { applyAction, getCard, getPlaymat, player_name } =
        useShahrazadGameContext();
    const { selectedCards } = useSelection();
    const player = usePlayer();
    const shah_card = getCard(cardId);
    const scry_card = useScrycard(shah_card.card_name);
    const playmat = getPlaymat(player);
    const [open, setOpen] = useState(true);
    const cards = selectedCards.includes(cardId) ? selectedCards : [cardId];
    let title = "";
    if (cards.length !== 1) {
        title = `(${cards.length}) cards`;
    } else if (shah_card.state.face_down) {
        title = "Face Down Card";
    } else {
        title = scry_card?.name || shah_card.card_name;
    }
    const related_cards =
        scry_card?.all_parts
            ?.slice(0, 5)
            .filter(
                (c) => c.name.toLowerCase() !== scry_card.name.toLowerCase()
            ) || [];

    return (
        <ContextMenu modal={open} onOpenChange={setOpen}>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuLabel>{title}</ContextMenuLabel>
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

                {isFlippable(scry_card) && cards.length === 1 && (
                    <ContextMenuItem
                        onClick={() => {
                            applyAction({
                                type: ShahrazadActionCase.CardState,
                                cards,
                                state: {
                                    flipped: !shah_card.state.flipped,
                                },
                            });
                        }}
                    >
                        Flip
                    </ContextMenuItem>
                )}
                {(!shah_card.state.face_down || cards.length > 1) && (
                    <ContextMenuItem
                        onClick={() => {
                            applyAction({
                                type: ShahrazadActionCase.CardState,
                                cards,
                                state: {
                                    revealed: [player_name],
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
                                    revealed: [],
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
                        {scry_card && related_cards.length === 1 && (
                            <ContextMenuItem
                                onClick={() => {
                                    applyAction({
                                        type: ShahrazadActionCase.ZoneImport,
                                        cards: [related_cards[0].id],
                                        player_id: player,
                                        zone: playmat.battlefield,
                                        token: true,
                                    });
                                }}
                            >
                                Summon token ({related_cards[0].name})
                            </ContextMenuItem>
                        )}
                        {related_cards.length > 1 && (
                            <ContextMenuSub>
                                <ContextMenuSubTrigger>
                                    Summon token
                                </ContextMenuSubTrigger>
                                <ContextMenuSubContent>
                                    {related_cards.map((card) => (
                                        <ContextMenuItem
                                            key={card.id}
                                            onClick={() => {
                                                applyAction({
                                                    type: ShahrazadActionCase.ZoneImport,
                                                    cards: [card.id],
                                                    player_id: player,
                                                    zone: playmat.battlefield,
                                                    token: true,
                                                });
                                            }}
                                        >
                                            {card.name}
                                        </ContextMenuItem>
                                    ))}
                                </ContextMenuSubContent>
                            </ContextMenuSub>
                        )}
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
                <ContextMenuItem
                    onClick={() => {
                        applyAction({
                            type: ShahrazadActionCase.ZoneImport,
                            cards: cards.map((s) => getCard(s).card_name),
                            player_id: player,
                            zone: playmat.battlefield,
                            token: true,
                        });
                    }}
                >
                    Clone
                </ContextMenuItem>
                {selectedCards.length === 0 && <></>}
            </ContextMenuContent>
        </ContextMenu>
    );
}
