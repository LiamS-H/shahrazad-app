import { useDroppable } from "@dnd-kit/core";
import { useShahrazadGameContext } from "../../../../contexts/game";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { IDroppableData } from "@/types/interfaces/dnd";
import { BoardCard } from "./board-card";
import { useSelection } from "@/contexts/selection";
import Selection from "./selection";

export const GRID_SIZE = 20;

export default function Board({ id }: { id: ShahrazadZoneId }) {
    const { getZone, getCard } = useShahrazadGameContext();
    const { selectedCards } = useSelection();
    const zone = getZone(id);
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

    const { setNodeRef, node } = useDroppable({
        id,
        data,
    });

    return (
        <div
            className="shahrazad-playmat-grid"
            style={{ position: "relative" }}
            ref={setNodeRef}
        >
            <Selection cards={cards} node={node} />
            {cards.map(({ id, card }) => (
                <BoardCard
                    card={card}
                    cardId={id}
                    selected={selectedCards.includes(id)}
                    key={id}
                />
            ))}
        </div>
    );
}
