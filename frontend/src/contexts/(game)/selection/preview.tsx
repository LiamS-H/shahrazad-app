import CardPreview from "@/components/(game)/card-preview";
import { useSelection } from ".";

import { useEffect, useMemo, useState } from "react";
import { ShahrazadCard } from "@/types/bindings/card";
import { useShahrazadGameContext } from "../game";
import { compareCards } from "@/lib/utils/compare";

export default function Preview() {
    const { currentPreview } = useSelection();
    const { getCard } = useShahrazadGameContext();

    const [shah_card, setCard] = useState<ShahrazadCard | null>(null);

    useEffect(() => {
        if (!currentPreview) {
            setCard(null);
            return;
        }
        const card = getCard(currentPreview);

        setCard((old) => {
            if (!card) return null;
            if (!old) return card;
            if (compareCards(old, card)) return old;
            return card;
        });
    }, [getCard, currentPreview]);

    return useMemo(() => {
        if (!shah_card) return null;
        return <CardPreview shah_card={shah_card} />;
    }, [shah_card]);
}
