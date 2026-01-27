import { useDroppable } from "@dnd-kit/core";
import { ShahrazadCardId } from "@/types/bindings/card";
import {
    SortableContext,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ScryingCard } from "./card";

export function ScryingZone({
    id,
    title,
    cards,
    sortable = true,
}: {
    id: string;
    title: string;
    cards: ShahrazadCardId[];
    sortable?: boolean;
}) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className="flex flex-col p-4 rounded-lg bg-secondary/20 border-2 border-dashed border-border min-h-52 items-center"
        >
            <h3 className="text-lg font-semibold">{title}</h3>

            <div className="flex flex-wrap overflow-visible pr-14 justify-center">
                {sortable ? (
                    <SortableContext
                        items={cards}
                        strategy={horizontalListSortingStrategy}
                    >
                        {cards.map((cardId) => (
                            <ScryingCard key={cardId} id={cardId} />
                        ))}
                    </SortableContext>
                ) : (
                    cards.map((cardId) => (
                        <ScryingCard key={cardId} id={cardId} />
                    ))
                )}
            </div>
        </div>
    );
}
