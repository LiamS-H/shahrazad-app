import {
    // ContextMenu,
    // ContextMenuContent,
    ContextMenuItem,
    // ContextMenuLabel,
    // ContextMenuRadioGroup,
    // ContextMenuRadioItem,
    // ContextMenuSeparator,
    // ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    // ContextMenuTrigger,
} from "@/components/(ui)/context-menu";
import { useShahrazadGameContext } from "@/contexts/game";
import { usePlayer } from "@/contexts/player";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadCardId } from "@/types/bindings/card";
import { ShahrazadPlaymatId } from "@/types/bindings/playmat";

function RevealToPlayer({
    cards,
    player_id,
}: {
    cards: ShahrazadCardId[];
    player_id: ShahrazadPlaymatId;
}) {
    const { applyAction, getPlaymat } = useShahrazadGameContext();
    const { player } = getPlaymat(player_id);
    return (
        <ContextMenuItem
            onClick={() => {
                applyAction({
                    type: ShahrazadActionCase.CardState,
                    cards: cards,
                    state: {
                        revealed: [player_id],
                    },
                });
            }}
        >
            {player.display_name}
        </ContextMenuItem>
    );
}

export function RevealRandomCard({ cards }: { cards: ShahrazadCardId[] }) {
    const { applyAction } = useShahrazadGameContext();
    return (
        <ContextMenuItem
            disabled={cards.length === 0}
            onClick={() => {
                const randomIndex = Math.floor(Math.random() * cards.length);
                applyAction({
                    type: ShahrazadActionCase.CardState,
                    cards: [cards[randomIndex]],
                    state: {
                        face_down: false,
                    },
                });
            }}
        >
            Reveal Random
        </ContextMenuItem>
    );
}

export function RevealToPlayers({ cards }: { cards: ShahrazadCardId[] }) {
    const { players, applyAction } = useShahrazadGameContext();
    const { player: current_player } = usePlayer();
    const player_options = players.filter((id) => id !== current_player);

    if (player_options.length <= 1) {
        return (
            <ContextMenuItem
                disabled={cards.length === 0}
                onClick={() => {
                    applyAction({
                        type: ShahrazadActionCase.CardState,
                        cards: cards,
                        state: {
                            face_down: false,
                        },
                    });
                }}
            >
                Reveal
            </ContextMenuItem>
        );
    }

    return (
        <>
            <ContextMenuSub>
                <ContextMenuSubTrigger disabled={cards.length === 0}>
                    Reveal to
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    {player_options.map((p) => (
                        <RevealToPlayer key={p} cards={cards} player_id={p} />
                    ))}
                </ContextMenuSubContent>
            </ContextMenuSub>
        </>
    );
}
