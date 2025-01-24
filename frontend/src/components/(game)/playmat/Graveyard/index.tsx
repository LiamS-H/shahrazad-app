import { useState } from "react";
import { useShahrazadGameContext } from "../../../../contexts/game";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import VerticalZone from "@/components/(game)/vertical-zone";
import { ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/(ui)/button";

export default function Graveyard(props: { id: ShahrazadZoneId }) {
    const { getZone } = useShahrazadGameContext();
    const zone = getZone(props.id);
    const [opened, setOpened] = useState(false);
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => {
                if (hovered == false && zone.cards.length > 1) {
                    setHovered(true);
                    setOpened(true);
                }
            }}
            onMouseLeave={() => setHovered(false)}
            className="shahrazad-graveyard relative"
        >
            <VerticalZone
                id={props.id}
                hidden={zone.cards.length == 0 || !opened}
                emptyMessage="graveyard"
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
        </div>
    );
}
