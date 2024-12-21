import { useState } from "react";
import { useShahrazadGameContext } from "../../../../contexts/game";
import { ShahrazadZoneId } from "../../../../types/interfaces/zone";
import VerticalZone from "../vertical-zone";
import { ArrowDownToLine } from "lucide-react";

export default function Command(props: { id: ShahrazadZoneId }) {
    const { getZone } = useShahrazadGameContext();
    const zone = getZone(props.id);
    const [opened, setOpened] = useState(false);
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => {
                if (hovered == false) {
                    setHovered(true);
                    setOpened(true);
                }
            }}
            onMouseLeave={() => setHovered(false)}
            className="shahrazad-command"
        >
            <VerticalZone
                id={props.id}
                hidden={zone.cards.length == 0 || !opened}
                emptyMessage="command"
            />
            {opened && zone.cards.length > 1 && (
                <button
                    style={{
                        position: "absolute",
                        bottom: "0px",
                        zIndex: 3,
                    }}
                    onClick={() => setOpened(false)}
                >
                    <ArrowDownToLine />
                </button>
            )}
        </div>
    );
}
