import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useShahrazadGameContext } from "@/contexts/game";
import { IDroppableData } from "@/types/interfaces/dnd";
import { useState } from "react";
import VerticalZone from "../../vertical-zone";
import { ArrowDownToLine } from "lucide-react";

export default function Exile(props: { id: ShahrazadZoneId }) {
    const { getZone } = useShahrazadGameContext();
    const zone = getZone(props.id);
    const [opened, setOpened] = useState(false);
    return (
        <div className="shahrazad-exile">
            <div
                onClick={() => {
                    setOpened((o) => !o);
                }}
            >
                <VerticalZone
                    id={props.id}
                    hidden={zone.cards.length == 0 || !opened}
                    emptyMessage="exile"
                />
            </div>
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
