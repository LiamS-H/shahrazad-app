import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import HorizontalZone from "@/components/(game)/horizontal-zone";
import Card from "../../card";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/(ui)/tooltip";
import { type ReactNode, useState } from "react";
import { usePlayer } from "@/contexts/(game)/player";
import HandContextMenu from "../../(context-menus)/hand";
import { LayoutGroup } from "framer-motion";
import HandCardContextMenu from "@/components/(game)/(context-menus)/hand-card";

function HandWrapper({
    id,
    length,
    children,
}: {
    id: ShahrazadZoneId;
    length: number;
    children: ReactNode;
}) {
    const [tooltipOpen, setTooltipOpen] = useState(false);
    return (
        <div className="shahrazad-hand flex flex-grow min-w-[100px] h-[140px]">
            <div className="relative z-10">
                <HandContextMenu zoneId={id}>
                    <div className="absolute bottom-1">
                        <Tooltip
                            open={tooltipOpen}
                            onOpenChange={setTooltipOpen}
                        >
                            <TooltipTrigger
                                className="w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex justify-center items-center"
                                onClick={() => setTooltipOpen(true)}
                            >
                                {length}
                            </TooltipTrigger>
                            <TooltipContent>
                                ({length}) cards in hand
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </HandContextMenu>
            </div>
            {children}
        </div>
    );
}

export default function Hand(props: { id: ShahrazadZoneId }) {
    const { active } = usePlayer();
    const { getZone, getCard, player_name } = useShahrazadGameContext();
    const hand = getZone(props.id);

    if (!active) {
        return (
            <HandWrapper id={props.id} length={hand.cards.length}>
                <LayoutGroup>
                    {hand.cards.map((id) => {
                        const shah_card = getCard(id);
                        return (
                            <HandCardContextMenu cardId={props.id}>
                                <Card
                                    id={id}
                                    key={id}
                                    animationTime={
                                        shah_card.state.face_down &&
                                        !shah_card.state.revealed?.includes(
                                            player_name
                                        )
                                            ? 0
                                            : undefined
                                    }
                                />
                            </HandCardContextMenu>
                        );
                    })}
                </LayoutGroup>
            </HandWrapper>
        );
    }

    return (
        <HandWrapper id={props.id} length={hand.cards.length}>
            <HorizontalZone id={props.id} />
        </HandWrapper>
    );
}
