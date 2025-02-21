import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/(ui)/alert-dialog";
import { Button } from "@/components/(ui)/button";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { usePlayer } from "@/contexts/(game)/player";
import { randomU64 } from "@/lib/utils/random";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { ListRestart, RotateCcw } from "lucide-react";

export function MulliganButton() {
    const { applyAction, getPlaymat, getZone, active_player } =
        useShahrazadGameContext();
    const { player: player_id } = usePlayer();

    const {
        battlefield,
        graveyard,
        exile,
        player: { display_name },
    } = getPlaymat(player_id);

    const { cards: battlefield_cards } = getZone(battlefield);
    const { cards: graveyard_cards } = getZone(graveyard);
    const { cards: exile_cards } = getZone(exile);

    function mulligan() {
        applyAction({
            type: ShahrazadActionCase.Mulligan,
            player_id,
            seed: randomU64(),
        });
    }

    if (
        battlefield_cards.length === 0 &&
        graveyard_cards.length === 0 &&
        exile_cards.length === 0
    ) {
        return (
            <Button variant="outline" size="icon" onClick={mulligan}>
                <ListRestart />
            </Button>
        );
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <RotateCcw />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogTitle>
                    {player_id == active_player
                        ? "Reset your board?"
                        : `Reset ${display_name}'s board?`}
                </AlertDialogTitle>
                <AlertDialogDescription>
                    This will return all of {display_name}
                    {"'"}s cards to their deck, and draw a new starting hand.
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={mulligan}>
                        Reset
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
