import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useZone } from "@/contexts/(game)/game";
import { useMemo, useState } from "react";
import VerticalZone from "../../vertical-zone";
import { ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/(ui)/button";
import ExileContextMenu from "../../(context-menus)/exile";
import ZoneWrapper from "../zone-wrapper";

export default function Exile(props: { id: ShahrazadZoneId }) {
    const zone = useZone(props.id);
    const [opened, setOpened] = useState(false);
    return useMemo(
        () => (
            <ExileContextMenu zoneId={props.id}>
                <ZoneWrapper
                    zoneId={props.id}
                    className="shahrazad-exile relative w-fit"
                >
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
                </ZoneWrapper>
            </ExileContextMenu>
        ),
        [zone, opened, props.id]
    );
}
