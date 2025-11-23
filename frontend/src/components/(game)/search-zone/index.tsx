import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useDroppable } from "@dnd-kit/core";
import { IDroppableData } from "@/types/interfaces/dnd";
import { DraggableCardWrapper } from "@/components/(game)/card-draggable";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ShahrazadCardId } from "@/types/bindings/card";
import { Scrycard, ScryNameCardText } from "react-scrycards";
import { Button } from "@/components/(ui)/button";
import { Switch } from "@/components/(ui)/switch";
import { Label } from "@/components/(ui)/label";
import { Input } from "@/components/(ui)/input";
import type { ScryfallColors } from "@scryfall/api-types";
import { LayoutGroup } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import SearchCardContextMenu from "@/components/(game)/(context-menus)/search-card";
import Card from "@/components/(game)/card";
import { LoaderCircle } from "lucide-react";
import { useScrycardsList } from "@/hooks/useScrycardsList";
import { compareList } from "@/lib/utils/compare";

const colors = ["C", "W", "U", "B", "R", "G"] as const;
const card_types = [
    "land",
    "creature",
    "artifact",
    "instant",
    "sorcery",
    "enchantment",
    "other",
] as const;

type CardType = (typeof card_types)[number];

interface ISort {
    type: CardType | null;
    colors:
        | null
        | {
              C: true;
              W?: false;
              U?: false;
              B?: false;
              R?: false;
              G?: false;
          }
        | {
              C: false;
              W?: boolean;
              U?: boolean;
              B?: boolean;
              R?: boolean;
              G?: boolean;
          };
    match: boolean;
    search: string;
}

type Color = (typeof colors)[number];

export default function SearchZone(props: { id: ShahrazadZoneId }) {
    const { getZone } = useShahrazadGameContext();

    const zone = getZone(props.id);
    const [sort, setSort] = useState<ISort>({
        colors: null,
        type: null,
        match: true,
        search: "",
    });

    const [cards, setCards] = useState<ShahrazadCardId[]>([]);
    const { cards: allCards, loading } = useScrycardsList(zone.cards);
    const [availableColors, setAvailableColors] = useState<Color[]>([]);

    const updateCards = useCallback(() => {
        const colors_in_zone = new Set<Color>();

        const filtered_cards = allCards.filter(({ card }) => {
            if (!card) return true;
            if (card.color_identity.length === 0) {
                colors_in_zone.add("C");
            } else {
                for (const color of card.color_identity) {
                    colors_in_zone.add(color as Color);
                }
            }

            if (sort.type) {
                const type_line =
                    "type_line" in card
                        ? card.type_line.toLowerCase()
                        : card.card_faces[0].type_line.toLowerCase();
                let matches_type = false;
                if (sort.type === "other") {
                    matches_type = !card_types.some(
                        (t) => t !== "other" && type_line.includes(t)
                    );
                } else {
                    matches_type = type_line.includes(sort.type);
                }
                if (!matches_type) return false;
            }

            if (sort.colors === null) return true;
            const color_identity =
                card.color_identity.length === 0
                    ? (["C"] as const)
                    : card.color_identity;
            if (sort.match) {
                for (const color of color_identity) {
                    if (sort.colors[color as Color]) return true;
                }
                return false;
            }
            for (const color of color_identity) {
                if (!sort.colors[color as Color]) return false;
            }
            for (const color of Object.keys(sort.colors) as ScryfallColors) {
                if (!sort.colors[color as Color]) continue;
                if (!(color_identity as string[]).includes(color)) return false;
            }

            return true;
        });
        setAvailableColors((old_colors) => {
            const new_colors = Array.from(colors_in_zone).sort((a, b) => {
                return colors.indexOf(a) - colors.indexOf(b);
            });
            if (compareList(old_colors, new_colors)) {
                return old_colors;
            }
            return new_colors;
        });

        const sorted_cards = filtered_cards.toSorted(
            ({ card: card1 }, { card: card2 }) => {
                let cost1 = 0;
                if (card1 && "cmc" in card1) {
                    cost1 = Number(card1?.cmc);
                    cost1 = Number.isNaN(cost1) ? 0 : cost1;
                }
                let cost2 = 0;
                if (card2 && "cmc" in card2) {
                    cost2 = Number(card2?.cmc);
                    cost2 = Number.isNaN(cost2) ? 0 : cost2;
                }

                if (cost1 === cost2) {
                    return (card1?.name || "").localeCompare(card2?.name || "");
                }

                return cost1 - cost2;
            }
        );

        const searched_cards = sorted_cards.filter(({ card }) => {
            if (!card) return true;
            if (!card.name.toLowerCase().includes(sort.search.toLowerCase()))
                return false;
            return true;
        });

        const new_cards = searched_cards.map(({ id }) => id);

        setCards((old) => {
            if (
                old.length === new_cards.length &&
                old.every((card, i) => card === new_cards[i])
            ) {
                return old;
            }
            return new_cards;
        });
    }, [allCards, sort]);

    useEffect(() => {
        updateCards();
    }, [sort, updateCards]);

    const data: IDroppableData = { sortable: true };

    const toggleColor = useCallback((color: Color) => {
        setSort((sort) => {
            switch (color) {
                case "C":
                    if (sort.colors === null) {
                        return { ...sort, colors: { C: true } };
                    }
                    if (!sort.colors.C) {
                        return { ...sort, colors: { C: true } };
                    }

                    if (
                        colors.every(
                            (c) =>
                                sort.colors &&
                                (color == c
                                    ? sort.colors[c] === true
                                    : sort.colors[c] !== true)
                        )
                    ) {
                        return { ...sort, colors: null };
                    }

                    return { ...sort, colors: { C: false } };
                default:
                    if (sort.colors === null) {
                        return {
                            ...sort,
                            colors: { C: false, [color]: true },
                        };
                    }
                    if (
                        colors.every(
                            (c) =>
                                sort.colors &&
                                (color == c
                                    ? sort.colors[c] === true
                                    : sort.colors[c] !== true)
                        )
                    ) {
                        return { ...sort, colors: null };
                    }
                    return {
                        ...sort,
                        colors: {
                            ...sort.colors,
                            C: false,
                            [color]: !sort.colors[color],
                        },
                    };
            }
        });
        return;
    }, []);

    const color_buttons = useMemo(
        () =>
            availableColors.map((color) => (
                <Button
                    onClick={() => toggleColor(color)}
                    variant={
                        sort.colors && sort.colors[color] ? "default" : "ghost"
                    }
                    key={color}
                >
                    <ScryNameCardText>{`{${color}}`}</ScryNameCardText>
                </Button>
            )),
        [availableColors, sort.colors, toggleColor]
    );

    const setType = useCallback((type: CardType) => {
        setSort((s) => ({
            ...s,
            type: s.type === type ? null : type,
        }));
    }, []);

    const type_buttons = useMemo(
        () =>
            card_types.map((card_type) => (
                <Button
                    key={card_type}
                    onClick={() => setType(card_type)}
                    variant={sort.type === card_type ? "default" : "ghost"}
                    className="capitalize"
                >
                    {card_type}
                </Button>
            )),
        [setType, sort.type]
    );

    const { setNodeRef, node } = useDroppable({ id: props.id, data });
    const colVirtualizer = useVirtualizer({
        horizontal: true,
        count: cards.length,
        getScrollElement: () => node.current,
        estimateSize: () => 100 + 8,
    });

    return (
        <div className="w-full flex flex-col gap-4 h-[240px]">
            <div className="ml-16 max-w-7xl flex flex-col gap-2">
                <div className="flex flex-row gap-6 items-center">
                    <div>
                        <Input
                            value={sort.search}
                            onChange={(e) =>
                                setSort((s) => ({
                                    ...s,
                                    search: e.target.value,
                                }))
                            }
                            placeholder="Search 🔎︎"
                        />
                    </div>
                    <div className="flex flex-row space-x-2 min-w-24 items-center">
                        <Switch
                            id="match-switch"
                            checked={sort.match}
                            onCheckedChange={() =>
                                setSort((sort) => ({
                                    ...sort,
                                    match: !sort.match,
                                }))
                            }
                        />
                        <Label htmlFor="match-switch">
                            {sort.match ? "Includes" : "Exactly"}
                        </Label>
                    </div>
                    <div className="flex flex-row space-x-2 ">
                        {color_buttons}
                    </div>
                    <div className="flex flex-row space-x-2 justify-center">
                        {type_buttons}
                    </div>
                </div>
            </div>
            <div ref={setNodeRef} className="overflow-x-auto relative h-fit">
                <div
                    style={{
                        width: `${colVirtualizer.getTotalSize()}px`,
                        height: "140px",
                        position: "relative",
                    }}
                >
                    {cards.length === 0 ? (
                        loading === true ? (
                            <LoaderCircle className="animate-spin" />
                        ) : (
                            <Scrycard card={undefined} />
                        )
                    ) : (
                        <LayoutGroup>
                            {colVirtualizer
                                .getVirtualItems()
                                .map((virtualItem) => (
                                    <DraggableCardWrapper
                                        key={virtualItem.key}
                                        id={cards[virtualItem.index]}
                                        divStyle={{
                                            left: `${virtualItem.start}px`,
                                            position: "absolute",
                                        }}
                                    >
                                        <SearchCardContextMenu
                                            cardId={cards[virtualItem.index]}
                                            zoneId={props.id}
                                        >
                                            <Card
                                                id={cards[virtualItem.index]}
                                                animationTime={null}
                                            />
                                        </SearchCardContextMenu>
                                    </DraggableCardWrapper>
                                ))}
                        </LayoutGroup>
                    )}
                </div>
            </div>
        </div>
    );
}
