import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useZone } from "@/contexts/(game)/game";
import { useState, useMemo, useCallback } from "react";
import VerticalZone from "@/components/(game)/vertical-zone";
import { ArrowDownToLine, SquareArrowOutUpRight } from "lucide-react";
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
                    {top !== undefined ? (
                        <Card id={top} />
                    ) : (
                        <Scrycard card={undefined} />
                    )}
                </Scrydeck>
            );
        }

        return (
            <>
                <PoppedOutZone
                    hidden={!poppedOut}
                    id={props.id}
                    name="Exile"
                    onClose={onClose}
                    pos={{ x: window.innerWidth - 859, y: 80 }}
                />
                <ExileContextMenu
                    cardId={zone.cards.at(-1) ?? -1}
                    zoneId={props.id}
                    onPopOut={() => setPoppedOut((o) => !o)}
                    poppedOut={poppedOut}
                >
                    {poppedOut ? (
                        <button
                            onClick={() => setPoppedOut((o) => !o)}
                            className="scrycard flex flex-col w-[100px]"
                        >
                            <span className="text-muted-foreground">exile</span>
                            <span className="text-muted-foreground">
                                (popped out)
                            </span>
                        </button>
                    ) : (
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
                                    emptyMessage="Exile"
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
                </ExileContextMenu>
            </>
        );
    }, [zone, opened, props.id, searching, poppedOut, onClose]);
}

/*
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useZone } from "@/contexts/(game)/game";
import { useState, useMemo, useCallback } from "react";
import { BookDashed } from "lucide-react";
import { Button } from "@/components/(ui)/button";
import ExileContextMenu from "@/components/(game)/(context-menus)/exile";
import ZoneWrapper from "../zone-wrapper";
import { useSearchContext } from "@/contexts/(game)/search";
import { PoppedOutZone } from "@/components/(game)/out-zone";
import { IDroppableData } from "@/types/interfaces/dnd";
import { useDroppable } from "@dnd-kit/core";

export default function Exile(props: { id: ShahrazadZoneId }) {
    const zone = useZone(props.id);
    const [poppedOut, setPoppedOut] = useState(false);
    const { active } = useSearchContext();
    const searching = active === props.id;

    const onClose = useCallback(() => {
        setPoppedOut(false);
    }, [setPoppedOut]);

    return useMemo(() => {
        if (searching) {
            return (
                <div className="w-full">
                    <Button
                        onClick={() => setPoppedOut((o) => !o)}
                        variant="outline"
                        size="icon"
                        className="text-muted-foreground"
                    >
                        <BookDashed />
                    </Button>
                </div>
            );
        }

        return (
            <div className="w-full h-9">
                <PoppedOutZone
                    hidden={!poppedOut}
                    id={props.id}
                    name="Exile"
                    onClose={onClose}
                    pos={{ x: window.innerWidth - 859, y: 80 }}
                />
                <ExileContextMenu
                    cardId={zone.cards.at(-1) ?? -1}
                    zoneId={props.id}
                    onPopOut={() => setPoppedOut((o) => !o)}
                    poppedOut={poppedOut}
                >
                    {poppedOut ? (
                        <Button
                            onClick={() => setPoppedOut((o) => !o)}
                            variant="outline"
                            size="icon"
                            className="text-muted-foreground"
                        >
                            <BookDashed />
                        </Button>
                    ) : (
                        <DroppableExile
                            id={props.id}
                            onClick={() => setPoppedOut((o) => !o)}
                        />
                    )}
                </ExileContextMenu>
            </div>
        );
    }, [zone, props.id, searching, poppedOut, onClose]);
}

function DroppableExile({
    id,
    onClick,
}: {
    id: ShahrazadZoneId;
    onClick: () => void;
}) {
    const data: IDroppableData = {};
    const { setNodeRef, isOver } = useDroppable({ id, data });

    return (
        <ZoneWrapper
            zoneId={id}
            className="absolute shahrazad-exile z-20 -m-4 p-4"
            ref={setNodeRef}
        >
            {isOver ? (
                <div className="scrycard flex flex-col w-[100px]">
                    <span className="text-muted-foreground">Exile</span>
                </div>
            ) : (
                <Button onClick={onClick} variant="outline" size="icon">
                    <BookDashed />
                </Button>
            )}
        </ZoneWrapper>
    );
}

 */
