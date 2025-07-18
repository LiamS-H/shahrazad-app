import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useZone } from "@/contexts/(game)/game";
import { useMemo, useState } from "react";
import VerticalZone from "@/components/(game)/vertical-zone";
import { ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/(ui)/button";
import ExileContextMenu from "@/components/(game)/(context-menus)/exile";
import ZoneWrapper from "../zone-wrapper";
import { useSearchContext } from "@/contexts/(game)/search";
import { Scrycard, Scrydeck } from "react-scrycards";
import Card from "@/components/(game)/card";

export default function Exile(props: { id: ShahrazadZoneId }) {
    const zone = useZone(props.id);
    const [opened, setOpened] = useState(false);
    const { active } = useSearchContext();
    const searching = active === props.id;

    return useMemo(() => {
        if (searching) {
            const top = zone.cards.at(-1);
            return (
                <Scrydeck count={zone.cards.length}>
                    {top ? <Card id={top} /> : <Scrycard card={undefined} />}
                </Scrydeck>
            );
        }

        return (
            <ExileContextMenu
                cardId={zone.cards.at(-1) ?? ""}
                zoneId={props.id}
            >
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
        );
    }, [zone, opened, props.id, searching]);
}
