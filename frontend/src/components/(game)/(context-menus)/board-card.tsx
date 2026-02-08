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
} from "@/components/(game)/(context-menus)/context-menu";
import { useCard, useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { useMemo, type ReactNode } from "react";
import { useSelection } from "@/contexts/(game)/selection";
import { isFlippable, useScrycard } from "react-scrycards";
import { usePlayer } from "@/contexts/(game)/player";
import { ContextMenuSubContent } from "@radix-ui/react-context-menu";
import type { ShahrazadCard, ShahrazadCardId } from "@/types/bindings/card";
import type { ScryfallCard } from "@scryfall/api-types";
import { Annotate } from "./(menu-items)/annotate";

function Content({
    cardId,
    shah_card,
    scry_card,
}: {
    cardId: ShahrazadCardId;
    shah_card: ShahrazadCard;
    scry_card: ScryfallCard.Any | undefined | null;
}) {
    const {
        applyAction,
        getCard,
        getPlaymat,
        active_player: player_name,
    } = useShahrazadGameContext();
    const { selectedCards } = useSelection();
    const { player } = usePlayer();
    const playmat = getPlaymat(player);
    const cards = useMemo(
        () => (selectedCards.includes(cardId) ? selectedCards : [cardId]),
        [selectedCards, cardId],
    );

    let title = "";
    if (cards.length !== 1) {
        title = `(${cards.length}) cards`;
    } else if (shah_card.state.face_down) {
        title = "Face Down Card";
    } else {
        title = scry_card?.name || shah_card.card_name;
    }
    const shah_cards = useMemo(
        () => cards.map((id) => getCard(id)),
        [cards, getCard],
    );

    const containsTapped = shah_cards.some((c) => c.state.tapped);
    const containsUnTapped = shah_cards.some((c) => !c.state.tapped);
    const containsFaceDown = shah_cards.some((c) => c.state.face_down);
    const containsFaceUp = shah_cards.some((c) => !c.state.face_down);
    const containsToken = shah_cards.some((s) => s?.token);
    const related_cards =
        scry_card?.all_parts
            ?.slice(0, 5)
            .filter(
                (c) => c.name.toLowerCase() !== scry_card.name.toLowerCase(),
            ) || [];
    return (
        <>
            <ContextMenuLabel>{title}</ContextMenuLabel>
            <ContextMenuSeparator />
            {containsUnTapped && (
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
            {containsTapped && (
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
            {containsFaceUp && (
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
            {containsFaceDown && (
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
                    {scry_card && related_cards.length == 1 && (
                        <ContextMenuItem
                            onClick={() => {
                                applyAction({
                                    type: ShahrazadActionCase.ZoneImport,
                                    cards: [
                                        {
                                            str: related_cards[0].id,
                                        },
                                    ],
                                    player_id: player,
                                    zone: playmat.battlefield,
                                    token: true,
                                    state: {},
                                });
                            }}
                        >
                            Summon token (
                            {related_cards.at(0)?.name || "loading..."})
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
                                                cards: [{ str: card.id }],
                                                player_id: player,
                                                zone: playmat.battlefield,
                                                token: true,
                                                state: {},
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
                    {shah_card.state.counters &&
                        shah_card.state.counters.length >= 1 && (
                            <ContextMenuItem
                                onClick={() => {
                                    shah_card.state.counters?.pop();
                                    applyAction({
                                        type: ShahrazadActionCase.CardState,
                                        cards,
                                        state: {
                                            counters: shah_card.state.counters,
                                        },
                                    });
                                }}
                            >
                                Remove counter
                            </ContextMenuItem>
                        )}
                </>
            )}
            <ContextMenuItem
                onClick={() => {
                    applyAction({
                        type: ShahrazadActionCase.ZoneImport,
                        cards: cards.map((s) => ({
                            str: getCard(s).card_name,
                        })),
                        player_id: player,
                        zone: playmat.battlefield,
                        token: true,
                        state: {},
                    });
                }}
            >
                Clone
            </ContextMenuItem>
            {containsToken && (
                <ContextMenuItem
                    onClick={() => {
                        applyAction({
                            type: ShahrazadActionCase.DeleteToken,
                            cards,
                        });
                    }}
                >
                    Delete Token{cards.length > 1 ? "s" : ""}
                </ContextMenuItem>
            )}
            {cards.length === 1 && (
                <Annotate cards={cards} shah_card={shah_card} />
            )}
        </>
    );
}

export default function BoardCardContextMenu({
    cardId,
    children,
}: {
    cardId: ShahrazadCardId;
    children: ReactNode;
}) {
    const shah_card = useCard(cardId);
    const scry_card = useScrycard(shah_card.card_name);

    return useMemo(() => {
        return (
            <ContextMenu modal>
                <ContextMenuTrigger cardId={cardId}>
                    {children}
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <Content
                        cardId={cardId}
                        scry_card={scry_card}
                        shah_card={shah_card}
                    />
                </ContextMenuContent>
            </ContextMenu>
        );
    }, [shah_card, scry_card, children, cardId]);
}
