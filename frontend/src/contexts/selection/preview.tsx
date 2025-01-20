import Card from "@/components/(game)/card-preview";
import { useSelection } from ".";

import { useShahrazadGameContext } from "@/contexts/game";

export default function Preview() {
    const { currentPreview } = useSelection();
    const { getCard } = useShahrazadGameContext();

    if (currentPreview === null) return null;

    const shah_card = getCard(currentPreview);

    return <Card shah_card={shah_card} />;
}
