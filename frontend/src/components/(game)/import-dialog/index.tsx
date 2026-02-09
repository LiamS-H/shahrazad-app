import { Input } from "@/components/(ui)/input";
import { Textarea } from "@/components/(ui)/textarea";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { importFromStr } from "@/lib/client/import-deck/importFromStr";
import { useRef, useState } from "react";
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

export function ImportDialog({
    player,
}: {
    player: ShahrazadPlaymatId | null;
}) {
    const { importFor } = useImportContext();
    const { applyAction, getPlaymat, active_player, settings } =
        useShahrazadGameContext();
    const [deckstr, setDeckstr] = useState<string>("");
    const [url, setUrl] = useState("");
    const [loading, _setLoading] = useState(false);
    const loadingRef = useRef(false);

    const open = player !== null;

    function close() {
        importFor(null);
    }

    function setLoading(l: boolean) {
        _setLoading(l);
        loadingRef.current = l;
    }

    async function importDeck() {
        if (!player) return false;
        if (loadingRef.current) {
            return false;
        }
        const playmat = getPlaymat(player);
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
        close();
        setLoading(false);
        toast("Deck imported.");
    }

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogTrigger asChild></DialogTrigger>
            <DialogContent className="flex flex-col gap-4">
                <DialogHeader>
                    <DialogTitle>
                        {player === active_player
                            ? "Import Your Deck"
                            : `Import ${player}'s Deck`}
                    </DialogTitle>
                    <DialogDescription className="flex flex-col">
                        <span>
                            Deck string or{" "}
                            <a
                                className="font-bold"
                                href="https://archidekt.com"
                                target="_blank"
                            >
                                Archidekt
                            </a>{" "}
                            deck link supported.
                        </span>
                        <span className="italic text-muted">
                            Moxfield deck link blocked by their firewall.
                        </span>
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
                        placeholder="https://archidekt.com/decks/XXXX/XXX"
                        onChange={(e) => setUrl(e.target.value)}
                        onFocus={(e) => e.target.select()}
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
