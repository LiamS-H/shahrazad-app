import { useState } from "react";
import { useShahrazadGameContext, useZone } from "@/contexts/(game)/game";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import VerticalZone from "@/components/(game)/vertical-zone";
import { ArrowDownToLine, Layers } from "lucide-react";
import { Button } from "@/components/(ui)/button";
import ZoneWrapper from "../zone-wrapper";
import { usePlayer } from "@/contexts/(game)/player";
import SideboardingModal from "@/components/(game)/sideboarding-modal";

export default function Sideboard(props: { id: ShahrazadZoneId }) {
    const zone = useZone(props.id);
    const [opened, setOpened] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const { active, player } = usePlayer();
    const { getPlaymat } = useShahrazadGameContext();

    if (!active) {
        return null;
    }

    const playmat = getPlaymat(player);

    return (
        <>
            <ZoneWrapper
                zoneId={props.id}
                onMouseEnter={() => {
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
                        onClick={() => setOpened(false)}
                    >
                        <ArrowDownToLine />
                    </Button>
                )}
                <Button
                    size="icon"
                    variant="outline"
                    className="absolute -top-2 -right-2 z-10"
                    onClick={() => setModalOpen(true)}
                >
                    <Layers />
                </Button>
            </ZoneWrapper>
            <SideboardingModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                deckId={playmat.library}
                sideboardId={props.id}
            />
        </>
    );
}
