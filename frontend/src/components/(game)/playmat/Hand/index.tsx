import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useShahrazadGameContext } from "@/contexts/game";
import HorizontalZone from "@/components/(game)/horizontal-zone";
import { Scrycard } from "react-scrycards";
import Card from "../../card";
import { useSelection } from "@/contexts/selection";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/(ui)/tooltip";

export default function Hand(props: { id: ShahrazadZoneId; active: boolean }) {
    const { getZone, getCard, player_name } = useShahrazadGameContext();
    const { setPreview } = useSelection();
    const zone = getZone(props.id);

    const cardCountChip = (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="relative z-10 pointer-events-none">
                    <div className="absolute bottom-1 w-6 h-6 rounded-full bg-destructive flex justify-center items-center">
                        {zone.cards.length}
                    </div>
                </div>
            </TooltipTrigger>
            <TooltipContent>({zone.cards.length}) cards in hand</TooltipContent>
        </Tooltip>
    );

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
                {cardCountChip}
            </div>
        );
    }

    return (
        <div className="shahrazad-hand flex flex-grow">
            {cardCountChip}
            <HorizontalZone id={props.id} />
        </div>
    );
}
