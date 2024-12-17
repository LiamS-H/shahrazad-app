import { ShahrazadZoneId } from "../../../../types/interfaces/zone";
import { useShahrazadGameContext } from "../../../../contexts/game";
import { useDroppable } from "@dnd-kit/core";
import StackZone from "../../card-stack";
import { IDroppableData } from "../../../../types/interfaces/dnd";
import { Scrycard } from "react-scrycards";

export default function Deck(props: { id: ShahrazadZoneId }) {
    const { getZone } = useShahrazadGameContext();
    const zone = getZone(props.id);
    const deckSize = zone.cards.length;
    const data: IDroppableData = {};
    const { setNodeRef } = useDroppable({ id: props.id, data });

    return (
        <div
            className="shahrazad-deck"
            style={{ width: "auto" }}
            ref={(ref) => setNodeRef(ref)}
        >
            <StackZone
                emptyMessage={() => (
                    <Scrycard
                        card={undefined}
                        symbol_text_renderer={() => null}
                    />
                )}
                cards={zone.cards}
            />
        </div>
    );
}
