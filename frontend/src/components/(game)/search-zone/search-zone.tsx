import { useShahrazadGameContext } from "@/contexts/game";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { useDroppable } from "@dnd-kit/core";
import { IDroppableData } from "@/types/interfaces/dnd";
import DraggableCard from "../card-draggable";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { ShahrazadCardId } from "@/types/bindings/card";
import {
    Scrycard,
    ScryNameCardText,
    useScrycardsContext,
} from "react-scrycards";
import { Button } from "@/components/(ui)/button";
import { Switch } from "@/components/(ui)/switch";
import { Label } from "@/components/(ui)/label";
import { Input } from "@/components/(ui)/input";

interface ISort {
    type: "lands" | "creatures" | "artifacts" | "spells" | null;
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

type Color = "C" | "W" | "U" | "B" | "R" | "G";

export default function SearchZone(props: { id: ShahrazadZoneId }) {
    const { getZone, getCard } = useShahrazadGameContext();
    const { requestCard } = useScrycardsContext();
    const zone = getZone(props.id);
    const [sort, setSort] = useState<ISort>({
        colors: null,
        type: null,
        match: true,
        search: "",
    });
    const [cards, setCards] = useState<ShahrazadCardId[]>([]);

    const updateCards = useCallback(async () => {
        const promises = [];
        for (const card_id of zone.cards) {
            const shah_card = getCard(card_id);
            promises.push(requestCard(shah_card.card_name));
        }
        const scrycards = await Promise.all(promises);
        const cards = [];
        for (let i = 0; i < scrycards.length; i++) {
            cards.push({ id: zone.cards[i], card: scrycards[i] });
        }

        const filtered_cards = cards.filter(({ card }) => {
            if (!card) return false;
            switch (sort.type) {
                case "lands":
                case "creatures":
                case "artifacts":
                case "spells":
                default:
            }
            if (!sort.colors) return true;
            const color_identity =
                card.color_identity.length === 0
                    ? (["C"] as const)
                    : card.color_identity;
            if (sort.match) {
                for (const color of color_identity) {
                    if (sort.colors[color]) return true;
                }
                return false;
            }
            for (const color of color_identity) {
                if (!sort.colors[color]) return false;
            }

            return true;
        });
        if (filtered_cards.length === 0 && sort.search) {
            setSort((s) => ({
                colors: null,
                type: null,
                match: s.match,
                search: s.search,
            }));
            return;
        }
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
            if (!card) return false;
            if (!card.name.toLowerCase().includes(sort.search.toLowerCase()))
                return false;
            return true;
        });

        const new_cards = searched_cards.map(({ id }) => id);

        setCards((old) => (new_cards === old ? old : new_cards));
    }, [zone, sort, getCard, requestCard]);

    useEffect(() => {
        updateCards();
    }, [zone, sort, updateCards]);

    const data: IDroppableData = { sortable: true };

    const { setNodeRef } = useDroppable({ id: props.id, data });

    const color_buttons: ReactNode[] = [];

    const toggleColor = (color: Color) => {
        switch (color) {
            case "C":
                setSort((sort) => {
                    if (sort.colors?.C)
                        return {
                            ...sort,
                            colors: { C: true },
                        };
                    return { ...sort, colors: { C: false } };
                });
            default:
                setSort((sort) => {
                    if (sort.colors === null) {
                        return { ...sort, colors: { C: false, [color]: true } };
                    }
                    return {
                        ...sort,
                        colors: {
                            ...sort.colors,
                            C: false,
                            [color]: !sort.colors[color],
                        },
                    };
                });
        }
    };

    for (const color of ["C", "W", "U", "B", "R", "G"] as const) {
        color_buttons.push(
            <Button
                onClick={() => toggleColor(color)}
                variant={
                    sort.colors && sort.colors[color] ? "default" : "ghost"
                }
                key={color}
            >
                <ScryNameCardText>{`{${color}}`}</ScryNameCardText>
            </Button>
        );
    }

    return (
        <div className="w-full flex flex-col gap-4 h-[150px]">
            <div
                className="w-full flex flex-row gap-6 items-center"
                // the above class stopped working idk
            >
                <div>
                    <Input
                        value={sort.search}
                        onChange={(e) =>
                            setSort((s) => ({
                                ...s,
                                search: e.target.value,
                            }))
                        }
                        placeholder="search🔎︎"
                    />
                </div>
                <div className="flex flex-row space-x-2 min-w-36">
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
                <div className="flex flex-row space-x-2 ">{color_buttons}</div>
            </div>
            <div
                ref={setNodeRef}
                className="w-full h-full flex flex-row flex-nowrap justify-center overflow-x-auto"
            >
                {cards.length === 0 ? (
                    <Scrycard card={undefined} />
                ) : (
                    cards.map((c) => <DraggableCard id={c} key={c} />)
                )}
            </div>
        </div>
    );
}
