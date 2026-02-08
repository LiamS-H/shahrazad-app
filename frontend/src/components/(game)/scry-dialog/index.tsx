import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/(ui)/dialog";
import Card from "@/components/(game)/card";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadCardId } from "@/types/bindings/card";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Scrydeck, Scrycard } from "react-scrycards";
import { ScryingZone } from "./zone";
import { ShahrazadZoneId } from "@/types/bindings/zone";

export default function ScryDialog({
    active,
    amount,
    close,
}: {
    active: ShahrazadZoneId | null;
    amount: number;
    close: () => void;
}) {
    const { applyAction, getZone } = useShahrazadGameContext();

    const [bottomCards, setBottomCards] = useState<ShahrazadCardId[]>([]);
    const [topCards, setTopCards] = useState<ShahrazadCardId[]>([]);
    const [activeId, setActiveId] = useState<ShahrazadCardId | null>(null);
    const zone = active ? getZone(active) : null;

    useEffect(() => {
        if (!zone) return;
        const len = zone.cards.length;
        const start = Math.max(0, len - amount);
        const scried = zone.cards.slice(start);
        setTopCards(scried);
        setBottomCards([]);
    }, [zone, amount]);

    function handleClose() {
        if (!active) {
            close();
            return;
        }
        if (bottomCards.length > 0) {
            applyAction({
                type: ShahrazadActionCase.CardZone,
                cards: bottomCards,
                destination: active,
                index: 0,
                state: {},
            });
        }

        if (topCards.length > 0) {
            applyAction({
                type: ShahrazadActionCase.CardZone,
                cards: topCards,
                destination: active,
                index: -1,
                state: {},
            });
        }
        close();
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    function findContainer(id: ShahrazadCardId | string) {
        if (id === "top-zone") return "top-zone";
        if (id === "bottom-zone") return "bottom-zone";
        if (topCards.includes(id as ShahrazadCardId)) return "top-zone";
        if (bottomCards.includes(id as ShahrazadCardId)) return "bottom-zone";
        return null;
    }

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as ShahrazadCardId);
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        const overId = over?.id;

        if (!overId || active.id === overId) {
            return;
        }

        const activeContainer = findContainer(active.id as ShahrazadCardId);
        const overContainer = findContainer(overId as string);
        if (
            !activeContainer ||
            !overContainer ||
            activeContainer === overContainer
        ) {
            return;
        }

        if (activeContainer !== overContainer) {
            const activeId = active.id as ShahrazadCardId;

            if (activeContainer === "top-zone") {
                setTopCards((items) =>
                    items.filter((item) => item !== activeId),
                );
                setBottomCards((items) => {
                    let newIndex;
                    if (overId === "bottom-zone") {
                        newIndex = items.length;
                    } else {
                        const overIndex = items.indexOf(
                            overId as ShahrazadCardId,
                        );
                        const isBelowOver =
                            over &&
                            active.rect.current.translated &&
                            active.rect.current.translated.top >
                                over.rect.top + over.rect.height;

                        const modifier = isBelowOver ? 1 : 0;
                        newIndex =
                            overIndex >= 0
                                ? overIndex + modifier
                                : items.length;
                    }

                    return [
                        ...items.slice(0, newIndex),
                        activeId,
                        ...items.slice(newIndex, items.length),
                    ];
                });
            } else {
                setBottomCards((items) =>
                    items.filter((item) => item !== activeId),
                );
                setTopCards((items) => {
                    let newIndex;
                    if (overId === "top-zone") {
                        newIndex = items.length;
                    } else {
                        const overIndex = items.indexOf(
                            overId as ShahrazadCardId,
                        );
                        const isBelowOver =
                            over &&
                            active.rect.current.translated &&
                            active.rect.current.translated.top >
                                over.rect.top + over.rect.height;

                        const modifier = isBelowOver ? 1 : 0;
                        newIndex =
                            overIndex >= 0
                                ? overIndex + modifier
                                : items.length;
                    }
                    return [
                        ...items.slice(0, newIndex),
                        activeId,
                        ...items.slice(newIndex, items.length),
                    ];
                });
            }
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeContainer = findContainer(active.id as ShahrazadCardId);
        const overContainer = findContainer(over.id as string);

        if (
            activeContainer &&
            overContainer &&
            activeContainer === overContainer
        ) {
            const activeIndex = (
                activeContainer === "top-zone" ? topCards : bottomCards
            ).indexOf(active.id as ShahrazadCardId);
            const overIndex = (
                overContainer === "top-zone" ? topCards : bottomCards
            ).indexOf(over.id as ShahrazadCardId);

            if (activeIndex !== overIndex) {
                if (activeContainer === "top-zone") {
                    setTopCards((items) =>
                        arrayMove(items, activeIndex, overIndex),
                    );
                } else {
                    setBottomCards((items) =>
                        arrayMove(items, activeIndex, overIndex),
                    );
                }
            }
        }
    }

    return (
        <Dialog
            open={active !== null}
            onOpenChange={(open) => {
                if (!open) handleClose();
            }}
        >
            <DialogContent className="max-w-[800px] w-full min-h-[400px] z-60">
                <DialogHeader>
                    <DialogTitle>Scrying ({amount})</DialogTitle>
                    <DialogDescription>Drag</DialogDescription>
                </DialogHeader>
                {active && zone && (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        onDragStart={handleDragStart}
                    >
                        <div className="flex flex-col gap-4 ">
                            <div className="flex-1 flex items-center justify-center gap-8">
                                <ScryingZone
                                    id="bottom-zone"
                                    title="Bottom"
                                    cards={bottomCards}
                                />

                                <div className="self-center">
                                    <Scrydeck count={zone.cards.length}>
                                        <Scrycard
                                            card={undefined}
                                            faceDown={zone.cards.length != 0}
                                        />
                                    </Scrydeck>
                                </div>

                                <ScryingZone
                                    id="top-zone"
                                    title="Top"
                                    cards={topCards}
                                    sortable
                                />
                            </div>
                        </div>
                        {createPortal(
                            <DragOverlay className="cursor-grabbing">
                                {activeId ? (
                                    <Card
                                        id={activeId}
                                        faceUp={true}
                                        animationTime={null}
                                    />
                                ) : null}
                            </DragOverlay>,
                            document.body,
                        )}
                    </DndContext>
                )}
            </DialogContent>
        </Dialog>
    );
}
