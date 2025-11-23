import { useCallback, useState } from "react";
import { useShahrazadGameContext, useZone } from "@/contexts/(game)/game";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import VerticalZone from "@/components/(game)/vertical-zone";
import { ArrowDownToLine, Layers } from "lucide-react";
import { Button } from "@/components/(ui)/button";
import ZoneWrapper from "../zone-wrapper";
import { usePlayer } from "@/contexts/(game)/player";
import SideboardingModal from "@/components/(game)/sideboarding-modal";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { randomU64 } from "@/lib/utils/random";

export default function Sideboard(props: { id: ShahrazadZoneId }) {
    const zone = useZone(props.id);
    const [opened, setOpened] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const { active, player } = usePlayer();
    const { getPlaymat, getZone, applyAction, active_player } =
        useShahrazadGameContext();

    const playmat = getPlaymat(player);

    const onOpenChange = useCallback(
        (o: boolean) => {
            setModalOpen(o);
            if (o) {
                applyAction({
                    type: ShahrazadActionCase.CardState,
                    cards: getZone(playmat.library).cards,
                    state: {
                        face_down: true,
                        revealed: [active_player],
                    },
                });
            }
            if (!o) {
                applyAction({
                    type: ShahrazadActionCase.Shuffle,
                    seed: randomU64(),
                    zone: playmat.library,
                });
            }
        },
        [applyAction, getZone, playmat.library, active_player]
    );

    if (!active) {
        return null;
    }

    return (
        <>
            <ZoneWrapper
                zoneId={props.id}
                onClick={() => {
                    if (hovered == false && zone.cards.length > 1) {
                        setHovered(true);
                        setOpened(true);
                    }
                }}
                onMouseLeave={() => setHovered(false)}
                className="shahrazad-command relative"
            >
                <VerticalZone
                    id={props.id}
                    hidden={zone.cards.length == 0 || !opened}
                    emptyMessage="sideboard"
                />
                {opened && zone.cards.length > 1 && (
                    <Button
                        size="icon"
                        variant="outline"
                        className="absolute -bottom-2 -left-2 z-10"
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpened(false);
                        }}
                    >
                        <ArrowDownToLine />
                    </Button>
                )}
                <Button
                    size="icon"
                    variant="outline"
                    className="absolute -top-2 -right-2 z-10"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenChange(true);
                    }}
                >
                    <Layers />
                </Button>
            </ZoneWrapper>
            <SideboardingModal
                open={modalOpen}
                onOpenChange={onOpenChange}
                deckId={playmat.library}
                sideboardId={props.id}
            />
        </>
    );
}
