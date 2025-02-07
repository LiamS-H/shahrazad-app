import CardPreview from "@/components/(game)/card-preview";
import { useSelection } from ".";

import { useShahrazadGameContext } from "@/contexts/(game)/game";

export default function Preview() {
    const { currentPreview } = useSelection();
    const { getCard } = useShahrazadGameContext();

    if (currentPreview === null) return null;

    const shah_card = getCard(currentPreview);
    if (!shah_card) return null;

    return <CardPreview shah_card={shah_card} />;
}
