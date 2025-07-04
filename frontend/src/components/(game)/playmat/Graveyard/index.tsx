import { useState } from "react";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import VerticalZone from "@/components/(game)/vertical-zone";
import { ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/(ui)/button";
import GraveyardContextMenu from "../../(context-menus)/graveyard";
import { useSearchContext } from "@/contexts/(game)/search";
import { Scrycard, Scrydeck } from "react-scrycards";
import Card from "../../card";
import ZoneWrapper from "../zone-wrapper";

export default function Graveyard(props: { id: ShahrazadZoneId }) {
    const { getZone } = useShahrazadGameContext();
    const zone = getZone(props.id);
    const [opened, setOpened] = useState(false);
    const [hovered, setHovered] = useState(false);
    const { active } = useSearchContext();
    const searching = active === props.id;

    if (searching) {
        const top = zone.cards.at(-1);
        return (
            <Scrydeck count={zone.cards.length}>
                {top ? <Card id={top} /> : <Scrycard card={undefined} />}
            </Scrydeck>
        );
    }

    return (
        <GraveyardContextMenu zoneId={props.id}>
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
                        onClick={() => setOpened(false)}
                    >
                        <ArrowDownToLine />
                    </Button>
                )}
            </ZoneWrapper>
        </GraveyardContextMenu>
    );
}
