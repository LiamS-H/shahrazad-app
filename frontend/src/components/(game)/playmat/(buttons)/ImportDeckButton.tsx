"use client";
import { Button } from "@/components/(ui)/button";
import { Input } from "@/components/(ui)/input";
import { Textarea } from "@/components/(ui)/textarea";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { usePlayer } from "@/contexts/(game)/player";
import { importFromStr } from "@/lib/client/import-deck/importFromStr";
import { Import } from "lucide-react";
import { useState } from "react";
import { importFromUrl } from "@/lib/client/import-deck/importFromUrl";
import { toast } from "sonner";
import { Label } from "@/components/(ui)/label";
import { ShahrazadAction } from "@/types/bindings/action";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/(ui)/dialog";

export function ImportDeckButton() {
    const { applyAction, getPlaymat, active_player } =
        useShahrazadGameContext();
    const { player } = usePlayer();
    const playmat = getPlaymat(player);
    const [deckstr, setDeckstr] = useState<string>("");
    const [url, setUrl] = useState("");

    async function importDeck() {
        let actions: ShahrazadAction[] | null | undefined;
        if (url) {
            actions = await importFromUrl(url, {
                deckId: playmat.library,
                sideboardId: playmat.command,
                playerId: player,
            });
            if (actions === undefined) {
                toast("Coudln't fetch deck.");
                return;
            }
        } else if (deckstr) {
            actions = importFromStr(deckstr, {
                deckId: playmat.library,
                sideboardId: playmat.command,
                playerId: player,
            });
            if (actions === undefined) {
                toast("Couldn't parse deck.");
                return;
            }
        }
        if (!actions) {
            toast("No cards to load.");
            return;
        }
        actions.forEach((a) => applyAction(a));
        setOpen(false);
        toast("Deck imported.");
    }

    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Import className="h-[1.2rem] w-[1.2rem]" />
                </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col gap-4">
                <DialogHeader>
                    <DialogTitle>
                        {player === active_player
                            ? "Import Your Deck"
                            : `Import ${player}'s Deck`}
                    </DialogTitle>
                    <DialogDescription>
                        Moxfield deck link or deck string supported.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        importDeck();
                    }}
                >
                    <Label htmlFor="deck-url">Link</Label>
                    <Input
                        id="deck-url"
                        placeholder="https://moxfield.com/decks/XXXX"
                        onChange={(e) => setUrl(e.target.value)}
                        value={url}
                    />
                </form>
                <div>
                    <Label htmlFor="deck-str">Deck String</Label>
                    <Textarea
                        placeholder={`1 Opt \n1 Consider`}
                        className="min-h-24"
                        value={deckstr}
                        onChange={(e) => setDeckstr(e.target.value)}
                    />
                </div>
                <Button disabled={!url && !deckstr} onClick={importDeck}>
                    Import
                </Button>
            </DialogContent>
        </Dialog>
    );
}
