import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useShahrazadGameContext } from "../../../../contexts/game";
import { useDroppable } from "@dnd-kit/core";
import CardStack from "@/components/(game)/card-stack";
import { IDroppableData } from "@/types/interfaces/dnd";
import { Scrycard } from "react-scrycards";
import DeckContextMenu from "@/components/(game)/(context-menus)/deck";
import { useSearchContext } from "@/contexts/search";

export default function Deck(props: { id: ShahrazadZoneId }) {
    const { getZone } = useShahrazadGameContext();
    const { active } = useSearchContext();
    const zone = getZone(props.id);
    const data: IDroppableData = {};
    const searching = active === props.id;
    const drag_id = searching ? `disabled:${props.id}` : props.id;
    const { setNodeRef } = useDroppable({ id: drag_id, data });

    return (
        <div
            className="shahrazad-deck"
            style={{ width: "auto" }}
            ref={(ref) => setNodeRef(ref)}
        >
            <DeckContextMenu zoneId={props.id}>
                <CardStack
                    emptyMessage={() => (
                        <Scrycard
                            card={undefined}
                            symbol_text_renderer={() => null}
                        />
                    )}
                    cards={zone.cards}
                    dragNamespace={searching ? "disabled" : undefined}
                />
            </DeckContextMenu>
        </div>
    );
}
