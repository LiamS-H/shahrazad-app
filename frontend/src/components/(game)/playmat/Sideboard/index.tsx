import { useState } from "react";
import { useZone } from "@/contexts/(game)/game";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import VerticalZone from "@/components/(game)/vertical-zone";
import { ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/(ui)/button";
import ZoneWrapper from "../zone-wrapper";

export default function Sideboard(props: { id: ShahrazadZoneId }) {
    const zone = useZone(props.id);
    const [opened, setOpened] = useState(false);
    const [hovered, setHovered] = useState(false);

    if (zone.cards.length === 0) {
        return null;
    }

    return (
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
        </ZoneWrapper>
    );
}
