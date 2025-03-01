import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { useState } from "react";
import VerticalZone from "../../vertical-zone";
import { ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/(ui)/button";
import ExileContextMenu from "../../(context-menus)/exile";

export default function Exile(props: { id: ShahrazadZoneId }) {
    const { getZone } = useShahrazadGameContext();
    const zone = getZone(props.id);
    const [opened, setOpened] = useState(false);
    return (
        <ExileContextMenu zoneId={props.id}>
            <div className="shahrazad-exile relative w-fit">
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
        </ExileContextMenu>
    );
}
