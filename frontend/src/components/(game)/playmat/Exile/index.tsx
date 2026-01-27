import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useZone } from "@/contexts/(game)/game";
import { useState, useMemo, useCallback } from "react";
import VerticalZone from "@/components/(game)/vertical-zone";
import { ArrowDownToLine, ExternalLink } from "lucide-react";
import { Button } from "@/components/(ui)/button";
import ExileContextMenu from "@/components/(game)/(context-menus)/exile";
import ZoneWrapper from "../zone-wrapper";
import { useSearchContext } from "@/contexts/(game)/search";
import { Scrycard, Scrydeck } from "react-scrycards";
import Card from "@/components/(game)/card";
import { PoppedOutZone } from "@/components/(game)/out-zone";

export default function Exile(props: { id: ShahrazadZoneId }) {
    const zone = useZone(props.id);
    const [opened, setOpened] = useState(false);
    const [poppedOut, setPoppedOut] = useState(false);
    const { active } = useSearchContext();
    const searching = active === props.id;

    const onClose = useCallback(() => {
        setOpened(false);
        setPoppedOut(false);
    }, [setPoppedOut]);

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
                        onClose={onClose}
                        pos={{ x: window.innerWidth - 500, y: 80 }}
                    />
                    <button
                        onClick={onClose}
                        className="w-[100px] h-[140px] bg-muted rounded-lg opacity-50 flex flex-col justify-center items-center cursor-pointer"
                    >
                        <span className="text-muted-foreground">exile</span>
                        <span className="text-muted-foreground">
                            (popped out)
                        </span>
                    </button>
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
                        <>
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
                            <Button
                                size="icon"
                                variant="outline"
                                className="absolute -bottom-2 -right-2 z-10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPoppedOut(true);
                                }}
                            >
                                <ExternalLink />
                            </Button>
                        </>
                    )}
                </ZoneWrapper>
            </ExileContextMenu>
        );
    }, [zone, opened, props.id, searching, poppedOut, onClose]);
}
