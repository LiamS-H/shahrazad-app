import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useShahrazadGameContext } from "@/contexts/game";
import HorizontalZone from "@/components/(game)/horizontal-zone";
import { Scrycard } from "react-scrycards";
import Card from "../../card";

export default function Hand(props: { id: ShahrazadZoneId; active: boolean }) {
    const { getZone, getCard } = useShahrazadGameContext();
    const zone = getZone(props.id);

    if (!props.active) {
        return (
            <div className="shahrazad-hand flex flex-grow">
                {zone.cards.map((id) => {
                    const shah_card = getCard(id);
                    if (shah_card.state.face_down) {
                        return <Scrycard key={id} card={null} faceDown />;
                    }
                    return (
                        <div data-shahcard={id} key={id}>
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
