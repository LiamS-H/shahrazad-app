"use client";
import { Button } from "@/components/(ui)/button";
import { Input } from "@/components/(ui)/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";
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

export function ImportDeckButton() {
    const { applyAction, getPlaymat } = useShahrazadGameContext();
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
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                    <Import className="h-[1.2rem] w-[1.2rem]" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-4">
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        importDeck();
                    }}
                >
                    <Label htmlFor="deck-url">Link</Label>
                    <Input
                        id="deck-url"
                        placeholder="(only moxfield supported for now)"
                        onChange={(e) => setUrl(e.target.value)}
                        value={url}
                    />
                </form>
                <div>
                    <Label htmlFor="deck-str">Deck String</Label>
                    <Textarea
                        placeholder="deck string (mtgo works best)"
                        className="min-h-24"
                        value={deckstr}
                        onChange={(e) => setDeckstr(e.target.value)}
                    />
                </div>
                <Button disabled={!url && !deckstr} onClick={importDeck}>
                    Import
                </Button>
            </PopoverContent>
        </Popover>
    );
}
