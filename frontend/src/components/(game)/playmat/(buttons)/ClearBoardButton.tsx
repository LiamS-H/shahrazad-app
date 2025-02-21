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
import { ShahrazadActionCase } from "@/types/bindings/action";
import { X } from "lucide-react";

export function ClearBoardButton() {
    const { applyAction, getPlaymat, active_player } =
        useShahrazadGameContext();
    const { player: player_id } = usePlayer();
    const {
        player: { display_name },
    } = getPlaymat(player_id);
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <X />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogTitle>
                    {player_id == active_player
                        ? "Delete all of your cards?"
                        : `Delete all of ${display_name}'s cards?`}
                </AlertDialogTitle>
                <AlertDialogDescription>
                    This will remove all of {display_name}
                    {"'"}s cards in all zones.
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        onClick={() => {
                            applyAction({
                                type: ShahrazadActionCase.ClearBoard,
                                player_id,
                            });
                        }}
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
