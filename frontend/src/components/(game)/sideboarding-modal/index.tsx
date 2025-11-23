import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/(ui)/dialog";
import { useShahrazadGameContext, useZone } from "@/contexts/(game)/game";
import { useScrycardsList } from "@/hooks/useScrycardsList";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { ScryfallCard } from "@scryfall/api-types";
import { useCallback, useMemo } from "react";
import { LoaderCircle } from "lucide-react";
import { PreviewCard } from "@/components/(game)/card-preview";
import Card from "@/components/(game)/card";
import { ShahrazadCardId } from "@/types/bindings/card";

interface SideboardingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deckId: ShahrazadZoneId;
    sideboardId: ShahrazadZoneId;
}

export default function SideboardingModal({
    open,
    onOpenChange,
    deckId,
    sideboardId,
}: SideboardingModalProps) {
    const { applyAction } = useShahrazadGameContext();
    const deck = useZone(deckId);
    const sideboard = useZone(sideboardId);

    const { cards: deckCards, loading: loadingDeck } = useScrycardsList(
        deck.cards
    );
    const { cards: sideboardCards, loading: loadingSideboard } =
        useScrycardsList(sideboard.cards);

    const deckColumns = useMemo(() => {
        const columns: Record<
            string,
            { id: string; card?: ScryfallCard.Any }[]
        > = {
            lands: [],
            cmc0: [],
            cmc1: [],
            cmc2: [],
            cmc3: [],
            cmc4: [],
            cmc5: [],
            cmc6plus: [],
        };

        deckCards.forEach((item) => {
            if (!item.card) return;

            const type_line =
                "type_line" in item.card
                    ? item.card.type_line.toLowerCase()
                    : item.card.card_faces[0].type_line.toLowerCase();

            if (type_line.includes("land")) {
                columns.lands.push(item);
                return;
            }

            let cmc = 0;
            if ("cmc" in item.card) {
                cmc = item.card.cmc || 0;
            }

            if (cmc === 0) columns.cmc0.push(item);
            else if (cmc === 1) columns.cmc1.push(item);
            else if (cmc === 2) columns.cmc2.push(item);
            else if (cmc === 3) columns.cmc3.push(item);
            else if (cmc === 4) columns.cmc4.push(item);
            else if (cmc === 5) columns.cmc5.push(item);
            else columns.cmc6plus.push(item);
        });

        // Sort each column by name
        Object.values(columns).forEach((col) => {
            col.sort((a, b) =>
                (a.card?.name || "").localeCompare(b.card?.name || "")
            );
        });

        return columns;
    }, [deckCards]);

    const sortedSideboard = useMemo(() => {
        return [...sideboardCards].sort((a, b) => {
            let cmcA = 0;
            if (a.card && "cmc" in a.card) {
                cmcA = a.card.cmc || 0;
            }
            let cmcB = 0;
            if (b.card && "cmc" in b.card) {
                cmcB = b.card.cmc || 0;
            }
            if (cmcA !== cmcB) return cmcA - cmcB;
            return (a.card?.name || "").localeCompare(b.card?.name || "");
        });
    }, [sideboardCards]);

    const moveCard = useCallback(
        (cardId: ShahrazadCardId, destId: ShahrazadZoneId) => {
            applyAction({
                type: ShahrazadActionCase.CardZone,
                cards: [cardId],
                destination: destId,
                index: 0,
                state: {},
            });
        },
        [applyAction]
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Sideboarding</DialogTitle>
                    <DialogDescription>
                        Click cards to move between.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 flex flex-row gap-4 overflow-hidden">
                    {/* Sideboard Column */}
                    <div className="w-[200px] border-l pl-4 flex flex-col gap-1">
                        <div className="font-bold text-center">Sideboard</div>
                        <div className="flex flex-col items-center overflow-y-auto pb-4">
                            {sortedSideboard.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="w-fit cursor-pointer hover:scale-105 transition-transform relative"
                                    style={{
                                        marginTop: index === 0 ? 0 : "-120px",
                                    }}
                                    onClick={() => moveCard(item.id, deckId)}
                                >
                                    <Card id={item.id} animationTime={null} />
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Deck Columns */}
                    <div className="flex-1 flex flex-row gap-2 overflow-x-auto">
                        {Object.entries(deckColumns).map(([key, cards]) => {
                            if (cards.length === 0) return null;
                            return (
                                <div
                                    key={key}
                                    className="min-w-[110px] flex flex-col gap-1"
                                >
                                    <div className="font-bold text-center capitalize">
                                        {key
                                            .replace("cmc", "")
                                            .replace("plus", "+")}
                                    </div>
                                    <div className="flex flex-col items-center gap-[-100px] overflow-y-auto pb-4">
                                        {cards.map((item, index) => (
                                            <div
                                                key={item.id}
                                                className="w-fit cursor-pointer hover:scale-105 transition-transform relative"
                                                style={{
                                                    marginTop:
                                                        index === 0
                                                            ? 0
                                                            : "-120px",
                                                }}
                                                onClick={() =>
                                                    moveCard(
                                                        item.id,
                                                        sideboardId
                                                    )
                                                }
                                            >
                                                <Card
                                                    id={item.id}
                                                    animationTime={null}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {(loadingDeck || loadingSideboard) && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50">
                        <LoaderCircle className="animate-spin w-10 h-10" />
                    </div>
                )}
                <PreviewCard />
            </DialogContent>
        </Dialog>
    );
}
