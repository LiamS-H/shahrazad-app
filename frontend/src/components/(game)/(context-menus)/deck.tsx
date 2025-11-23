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
} from "@/components/(game)/(context-menus)/context-menu";
import { useShahrazadGameContext, useZone } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { type ReactNode } from "react";
import { randomU64 } from "@/lib/utils/random";
import { usePlayer } from "@/contexts/(game)/player";
import { useSearchContext } from "@/contexts/(game)/search";
import { DrawTo } from "./(menu-items)/draw-to";
import { KeyShortcut } from "@/components/(ui)/key-shortcut";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { ShahrazadCardId } from "@/types/bindings/card";
import { DeckTopReveal } from "@/types/bindings/playmat";

function Content({ zoneId }: { zoneId: ShahrazadZoneId }) {
    const { player } = usePlayer();
    const { applyAction, getPlaymat } = useShahrazadGameContext();
    const { search } = useSearchContext();
    const playmat = getPlaymat(player);
    const deck = useZone(zoneId);
    return (
        <>
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
            <ContextMenuSub>
                <ContextMenuSubTrigger>Flip Top</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <ContextMenuItem
                        onClick={() => {
                            applyAction({
                                type: ShahrazadActionCase.CardState,
                                cards: [deck.cards[deck.cards.length - 1]],
                                state: {
                                    face_down: true,
                                    revealed: [player],
                                },
                            });
                        }}
                    >
                        Once (Privately)
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={() => {
                            applyAction({
                                type: ShahrazadActionCase.CardState,
                                cards: [deck.cards[deck.cards.length - 1]],
                                state: {
                                    face_down: false,
                                    revealed: [],
                                },
                            });
                        }}
                    >
                        Once (Publicly)
                    </ContextMenuItem>

                    {playmat.reveal_deck_top !== DeckTopReveal.PRIVATE && (
                        <ContextMenuItem
                            onClick={() => {
                                applyAction({
                                    type: ShahrazadActionCase.SetPlaymat,
                                    player_id: player,
                                    reveal_deck_top: DeckTopReveal.PRIVATE,
                                });
                            }}
                        >
                            Privately
                        </ContextMenuItem>
                    )}

                    {playmat.reveal_deck_top !== DeckTopReveal.PUBLIC && (
                        <ContextMenuItem
                            onClick={() => {
                                applyAction({
                                    type: ShahrazadActionCase.SetPlaymat,
                                    player_id: player,
                                    reveal_deck_top: DeckTopReveal.PUBLIC,
                                });
                            }}
                        >
                            Publicly
                        </ContextMenuItem>
                    )}
                    {playmat.reveal_deck_top !== DeckTopReveal.NONE && (
                        <ContextMenuItem
                            onClick={() => {
                                applyAction({
                                    type: ShahrazadActionCase.SetPlaymat,
                                    player_id: player,
                                    reveal_deck_top: DeckTopReveal.NONE,
                                });
                            }}
                        >
                            Hidden
                        </ContextMenuItem>
                    )}
                </ContextMenuSubContent>
            </ContextMenuSub>
        </>
    );
}

export default function DeckContextMenu({
    zoneId,
    cardId,
    children,
}: {
    zoneId: ShahrazadZoneId;
    cardId: ShahrazadCardId;
    children: ReactNode;
}) {
    return (
        <ContextMenu>
            <ContextMenuTrigger cardId={cardId} zoneId={zoneId}>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent>
                <Content zoneId={zoneId} />
            </ContextMenuContent>
        </ContextMenu>
    );
}
