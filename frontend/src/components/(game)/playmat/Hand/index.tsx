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
import { useState } from "react";
import { usePlayer } from "@/contexts/player";

export default function Hand(props: { id: ShahrazadZoneId }) {
    const { active } = usePlayer();
    const { getZone, getCard, player_name } = useShahrazadGameContext();
    const { setPreview } = useSelection();
    const zone = getZone(props.id);
    const [tooltipOpen, setTooltipOpen] = useState(false);

    const cardCountChip = (
        <div className="relative z-10">
            <div className="absolute bottom-1">
                <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
                    <TooltipTrigger
                        className="w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex justify-center items-center"
                        onClick={() => setTooltipOpen(true)}
                    >
                        {zone.cards.length}
                    </TooltipTrigger>
                    <TooltipContent>
                        ({zone.cards.length}) cards in hand
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );

    if (!active) {
        return (
            <div className="shahrazad-hand flex flex-grow min-w-[100px] h-[140px]">
                {cardCountChip}
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
        <div className="shahrazad-hand flex flex-grow min-w-[100px] h-[140px]">
            {cardCountChip}
            <HorizontalZone id={props.id} />
        </div>
    );
}
