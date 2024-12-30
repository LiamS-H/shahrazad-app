import { useDroppable } from "@dnd-kit/core";
import { useShahrazadGameContext } from "../../../../contexts/game";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { IDroppableData } from "@/types/interfaces/dnd";
import { BoardCard } from "./board-card";

export const GRID_SIZE = 20;

export default function Board(props: { id: ShahrazadZoneId }) {
    const { getZone, getCard } = useShahrazadGameContext();
    const zone = getZone(props.id);
    const cards = zone.cards
        .map((id) => ({ card: getCard(id), id: id }))
        .toSorted(({ card: card1 }, { card: card2 }) => {
            card1.state.x ??= 0;
            card1.state.y ??= 0;
            card2.state.x ??= 0;
            card2.state.y ??= 0;
            if (card1.state.y != card2.state.y) {
                return card1.state.y - card2.state.y;
            }
            return card1.state.x - card2.state.x;
        });

    const data: IDroppableData = {
        grid: GRID_SIZE,
    };
    const { setNodeRef } = useDroppable({
        id: props.id,
        data,
    });
    return (
        <div
            className="shahrazad-playmat-grid"
            style={{ position: "relative" }}
            ref={setNodeRef}
        >
            {cards.map(({ id, card }) => BoardCard(id, card))}
        </div>
    );
}
