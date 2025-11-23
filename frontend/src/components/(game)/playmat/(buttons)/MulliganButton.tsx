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
import { useShahrazadGameContext, useZone } from "@/contexts/(game)/game";
import { usePlayer } from "@/contexts/(game)/player";
import { randomU64 } from "@/lib/utils/random";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { ListRestart, RotateCcw } from "lucide-react";
import { useCallback, useMemo } from "react";

export function MulliganButton() {
    const { applyAction, getPlaymat, active_player } =
        useShahrazadGameContext();
    const { player: player_id } = usePlayer();

    const {
        battlefield,
        graveyard,
        exile,
        player: { display_name },
    } = getPlaymat(player_id);

    const {
        cards: { length: bf_length },
    } = useZone(battlefield);
    const {
        cards: { length: gy_length },
    } = useZone(graveyard);
    const {
        cards: { length: ex_length },
    } = useZone(exile);

    const resetPlaymat = useCallback(() => {
        applyAction({
            type: ShahrazadActionCase.ResetPlaymat,
            player_id,
            seed: randomU64(),
        });
    }, [applyAction, player_id]);

    const mulligan = useCallback(() => {
        applyAction({
            type: ShahrazadActionCase.Mulligan,
            player_id,
            seed: randomU64(),
        });
    }, [applyAction, player_id]);

    const isEmpty = bf_length === 0 && gy_length === 0 && ex_length === 0;

    return useMemo(() => {
        if (isEmpty) {
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
                        {"'"}s cards to their deck.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={resetPlaymat}
                        >
                            Reset
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    }, [
        isEmpty,
        mulligan,
        resetPlaymat,
        active_player,
        display_name,
        player_id,
    ]);
}
