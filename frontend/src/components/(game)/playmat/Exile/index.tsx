import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useZone } from "@/contexts/(game)/game";
import { useState, useMemo } from "react";
import VerticalZone from "@/components/(game)/vertical-zone";
import { ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/(ui)/button";
import ExileContextMenu from "@/components/(game)/(context-menus)/exile";
import ZoneWrapper from "../zone-wrapper";
import { useSearchContext } from "@/contexts/(game)/search";
import { Scrycard, Scrydeck } from "react-scrycards";
import Card from "@/components/(game)/card";
import PoppedOutZone from "../../out-zone";

export default function Exile(props: { id: ShahrazadZoneId }) {
    const zone = useZone(props.id);
    const [opened, setOpened] = useState(false);
    const [poppedOut, setPoppedOut] = useState(false);
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

        if (poppedOut) {
            return (
                <>
                    <PoppedOutZone
                        id={props.id}
                        name="Exile"
                        onClose={() => setPoppedOut(false)}
                        pos={{ x: window.innerWidth - 500, y: 80 }}
                    />
                    <div className="w-[100px] h-[140px] bg-gray-500 rounded-lg opacity-50" />
                </>
            );
        }

        return (
            <ExileContextMenu
                cardId={zone.cards.at(-1) ?? ""}
                zoneId={props.id}
                onPopOut={() => setPoppedOut(true)}
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
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpened(false);
                            }}
                        >
                            <ArrowDownToLine />
                        </Button>
                    )}
                </ZoneWrapper>
            </ExileContextMenu>
        );
    }, [zone, opened, props.id, searching, poppedOut]);
}
