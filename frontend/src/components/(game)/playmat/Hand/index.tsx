import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useShahrazadGameContext } from "@/contexts/game";
import HorizontalZone from "@/components/(game)/horizontal-zone";
import { Scrycard } from "react-scrycards";
import Card from "../../card";
import { useSelection } from "@/contexts/selection";

export default function Hand(props: { id: ShahrazadZoneId; active: boolean }) {
    const { getZone, getCard, player_name } = useShahrazadGameContext();
    const { setPreview } = useSelection();
    const zone = getZone(props.id);

    if (!props.active) {
        return (
            <div className="shahrazad-hand flex flex-grow">
                {zone.cards.map((id) => {
                    const shah_card = getCard(id);
                    if (
                        shah_card.state.face_down &&
                        !shah_card.state.revealed?.includes(player_name)
                    ) {
                        return <Scrycard key={id} card={null} faceDown />;
                    }
                    return (
                        <div
                            className="cursor-pointer"
                            key={id}
                            onClick={() => {
                                setPreview(id);
                            }}
                        >
                            <Card id={id} />
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="shahrazad-hand flex flex-grow">
            <HorizontalZone id={props.id} />
        </div>
    );
}
