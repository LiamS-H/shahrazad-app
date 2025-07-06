import { ShahrazadZoneId } from "@/types/bindings/zone";
import {
    useCard,
    useShahrazadGameContext,
    useZone,
} from "@/contexts/(game)/game";
import HorizontalZone from "@/components/(game)/playmat/Hand/horizontal-zone";
import Card from "../../card";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/(ui)/tooltip";
import { type ReactNode, useMemo, useState } from "react";
import { usePlayer } from "@/contexts/(game)/player";
import HandContextMenu from "../../(context-menus)/hand";
import { LayoutGroup } from "framer-motion";
import ZoneWrapper from "../zone-wrapper";
import { ShahrazadCardId } from "@/types/bindings/card";

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
        <ZoneWrapper
            zoneId={id}
            className="shahrazad-hand flex flex-grow min-w-[100px] h-[140px]"
        >
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
        </ZoneWrapper>
    );
}

function InactiveHand({ id }: { id: ShahrazadCardId }) {
    const { active_player } = useShahrazadGameContext();
    const shah_card = useCard(id);
    return useMemo(
        () => (
            <Card
                id={id}
                animationTime={
                    shah_card.state.face_down &&
                    !shah_card.state.revealed?.includes(active_player)
                        ? 0
                        : undefined
                }
            />
        ),
        [shah_card, active_player, id]
    );
}

export default function Hand(props: { id: ShahrazadZoneId }) {
    const { active } = usePlayer();
    const hand = useZone(props.id);

    if (!active) {
        return (
            <HandWrapper id={props.id} length={hand.cards.length}>
                <LayoutGroup>
                    {hand.cards.map((id) => (
                        <InactiveHand key={id} id={id} />
                    ))}
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
