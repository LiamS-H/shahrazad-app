import { useState, useMemo, useCallback } from "react";
import { useZone } from "@/contexts/(game)/game";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import VerticalZone from "@/components/(game)/vertical-zone";
import { ArrowDownToLine, SquareArrowOutUpRight } from "lucide-react";
import { Button } from "@/components/(ui)/button";
import GraveyardContextMenu from "../../(context-menus)/graveyard";
import { useSearchContext } from "@/contexts/(game)/search";
import { Scrycard, Scrydeck } from "react-scrycards";
import Card from "../../card";
import ZoneWrapper from "../zone-wrapper";
import { PoppedOutZone } from "@/components/(game)/out-zone";

export default function Graveyard(props: { id: ShahrazadZoneId }) {
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

        return (
            <>
                <PoppedOutZone
                    hidden={!poppedOut}
                    id={props.id}
                    name="Graveyard"
                    onClose={onClose}
                    pos={{ x: window.innerWidth - 700, y: 80 }}
                />
                <GraveyardContextMenu
                    cardId={zone.cards.at(-1) ?? ""}
                    zoneId={props.id}
                    onPopOut={() => setPoppedOut((o) => !o)}
                    poppedOut={poppedOut}
                >
                    {poppedOut ? (
                        <button
                            onClick={() => setPoppedOut((o) => !o)}
                            className="scrycard flex flex-col w-[100px] cursor-pointer"
                        >
                            <span className="text-muted-foreground">
                                graveyard
                            </span>
                            <span className="text-muted-foreground">
                                (popped out)
                            </span>
                        </button>
                    ) : (
                        <ZoneWrapper
                            zoneId={props.id}
                            className="shahrazad-graveyard relative w-fit"
                        >
                            <div
                                onClick={() => {
                                    setOpened((o) => !o);
                                }}
                            >
                                <VerticalZone
                                    id={props.id}
                                    hidden={zone.cards.length == 0 || !opened}
                                    emptyMessage="graveyard"
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
                                        <SquareArrowOutUpRight />
                                    </Button>
                                </>
                            )}
                        </ZoneWrapper>
                    )}
                </GraveyardContextMenu>
            </>
        );
    }, [opened, props.id, searching, zone.cards, poppedOut, onClose]);
}
