import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useShahrazadGameContext, useZone } from "@/contexts/(game)/game";
import { useDroppable } from "@dnd-kit/core";
import CardStack from "@/components/(game)/card-stack";
import { IDroppableData } from "@/types/interfaces/dnd";
import { Scrycard, Scrydeck } from "react-scrycards";
import DeckContextMenu from "@/components/(game)/(context-menus)/deck";
import { useSearchContext } from "@/contexts/(game)/search";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { usePlayer } from "@/contexts/(game)/player";
import Card from "@/components/(game)/card";
import { useEffect, useMemo, useRef } from "react";
import { randomU64 } from "@/lib/utils/random";
import ZoneWrapper from "../zone-wrapper";

export default function Deck(props: { id: ShahrazadZoneId }) {
    const { applyAction, active_player, getPlaymat } =
        useShahrazadGameContext();
    const { active } = useSearchContext();
    const last_active = useRef(active);
    const { player } = usePlayer();
    const playmat = getPlaymat(player);
    const zone = useZone(props.id);
    const data: IDroppableData = {};
    const searching = active === props.id;
    const drag_id = searching ? `disabled:${props.id}` : props.id;
    const { setNodeRef } = useDroppable({ id: drag_id, data });

    useEffect(() => {
        if (active !== props.id && last_active.current === props.id) {
            applyAction({
                type: ShahrazadActionCase.Shuffle,
                seed: randomU64(),
                zone: props.id,
            });
        }
        if (active === props.id && last_active.current !== props.id) {
            applyAction({
                type: ShahrazadActionCase.CardState,
                cards: zone.cards,
                state: { revealed: [active_player] },
            });
        }
        last_active.current = active;
    }, [active, applyAction, props.id, active_player, zone.cards]);

    return useMemo(() => {
        if (searching) {
            const top = zone.cards.at(-1);
            return (
                <Scrydeck count={zone.cards.length}>
                    {top ? <Card id={top} /> : <Scrycard card={undefined} />}
                </Scrydeck>
            );
        }

        return (
            <ZoneWrapper
                zoneId={props.id}
                className="shahrazad-deck w-fit"
                ref={(ref) => setNodeRef(ref)}
            >
                <DeckContextMenu cardId={zone.cards[0]} zoneId={props.id}>
                    <div
                        onClick={(e) => {
                            if (e.buttons !== 0) return;
                            applyAction({
                                type: ShahrazadActionCase.DrawTop,
                                amount: 1,
                                source: props.id,
                                destination: playmat.hand,
                                state: { revealed: [player] },
                            });
                        }}
                    >
                        <CardStack
                            emptyMessage={() => <Scrycard card={undefined} />}
                            cards={zone.cards}
                            dragNamespace={searching ? "disabled" : undefined}
                        />
                    </div>
                </DeckContextMenu>
            </ZoneWrapper>
        );
    }, [
        applyAction,
        player,
        playmat.hand,
        props.id,
        searching,
        setNodeRef,
        zone.cards,
    ]);
}
