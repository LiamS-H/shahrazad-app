import { useState, useMemo } from "react";
import { useZone } from "@/contexts/(game)/game";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import VerticalZone from "@/components/(game)/vertical-zone";
import { ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/(ui)/button";
import GraveyardContextMenu from "../../(context-menus)/graveyard";
import { useSearchContext } from "@/contexts/(game)/search";
import { Scrycard, Scrydeck } from "react-scrycards";
import Card from "../../card";
import ZoneWrapper from "../zone-wrapper";
import PoppedOutZone from "../../out-zone";
import CardStack from "../../card-stack";

export default function Graveyard(props: { id: ShahrazadZoneId }) {
    const zone = useZone(props.id);
    const [opened, setOpened] = useState(false);
    const [hovered, setHovered] = useState(false);
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
                        name="Graveyard"
                        onClose={() => setPoppedOut(false)}
                        pos={{ x: window.innerWidth - 800, y: 80 }}
                    />
                    <button
                        onClick={() => setPoppedOut(false)}
                        className="w-[100px] h-[140px] bg-muted rounded-lg opacity-50 flex flex-col justify-center items-center cursor-pointer"
                    >
                        <span className="text-muted-foreground">graveyard</span>
                        <span className="text-muted-foreground">
                            (popped out)
                        </span>
                    </button>
                </>
            );
        }

        return (
            <GraveyardContextMenu
                cardId={zone.cards.at(-1) ?? ""}
                zoneId={props.id}
                onPopOut={() => setPoppedOut(true)}
            >
                <ZoneWrapper
                    zoneId={props.id}
                    onMouseEnter={() => {
                        if (hovered == false && zone.cards.length > 1) {
                            setHovered(true);
                            setOpened(true);
                        }
                    }}
                    onMouseLeave={() => setHovered(false)}
                    className="shahrazad-graveyard relative w-fit"
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
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpened(false);
                            }}
                        >
                            <ArrowDownToLine />
                        </Button>
                    )}
                </ZoneWrapper>
            </GraveyardContextMenu>
        );
    }, [hovered, opened, props.id, searching, zone.cards, poppedOut]);
}
