import { Input } from "@/components/(ui)/input";
import { Textarea } from "@/components/(ui)/textarea";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { importFromStr } from "@/lib/client/import-deck/importFromStr";
import { useEffect, useRef, useState } from "react";
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
import { Button } from "@/components/(ui)/button";
import { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import { useImportContext } from "@/contexts/(game)/import";

export function ImportDialog({ player }: { player: ShahrazadPlaymatId }) {
    const { importFor } = useImportContext();
    const { applyAction, getPlaymat, active_player, settings } =
        useShahrazadGameContext();
    const playmat = getPlaymat(player);
    const [deckstr, setDeckstr] = useState<string>("");
    const [url, setUrl] = useState("");
    const [loading, _setLoading] = useState(false);
    const loadingRef = useRef(false);

    function setLoading(l: boolean) {
        _setLoading(l);
        loadingRef.current = l;
    }

    async function importDeck() {
        if (loadingRef.current) {
            return false;
        }
        loadingRef.current = true;
        let actions: ShahrazadAction[] | null | undefined;
        const sideboardId = settings.commander
            ? playmat.command
            : playmat.sideboard;
        setLoading(true);
        if (url) {
            actions = await importFromUrl(url, {
                deckId: playmat.library,
                sideboardId,
                playerId: player,
                settings,
            });
            if (actions === undefined) {
                toast("Coudln't fetch deck.");
                setLoading(false);
                return;
            }
        } else if (deckstr) {
            actions = importFromStr(deckstr, {
                deckId: playmat.library,
                sideboardId,
                playerId: player,
                settings,
            });
            if (actions === undefined) {
                toast("Couldn't parse deck.");
                setLoading(false);
                return;
            }
        }
        if (!actions) {
            toast("No cards to load.");
            setLoading(false);
            return;
        }
        actions.forEach((a) => applyAction(a));
        setOpen(false);
        setLoading(false);
        toast("Deck imported.");
    }

    const [open, setOpen] = useState(true);

    useEffect(() => {
        if (!open) {
            importFor(null);
        }
    }, [open, importFor]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild></DialogTrigger>
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
                        id="deck-str"
                        placeholder={`1 Opt \n1 Consider`}
                        className="min-h-24"
                        value={deckstr}
                        onChange={(e) => setDeckstr(e.target.value)}
                    />
                </div>
                <Button
                    disabled={(!url && !deckstr) || loading}
                    onClick={importDeck}
                >
                    {loading ? "Loading..." : "Import"}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
