"use client";
import { Input } from "@/components/(ui)/input";
import { Textarea } from "@/components/(ui)/textarea";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { importFromStr } from "@/lib/client/import-deck/importFromStr";
import { useRef, useState } from "react";
import { importFromUrl } from "@/lib/client/import-deck/importFromUrl";
import { toast } from "sonner";
import { Label } from "@/components/(ui)/label";
import { ShahrazadActionCase } from "@/types/bindings/action";
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
import { SavedDecks } from "./saved-decks";
import {
    IParsedDeck,
    toActionList,
} from "@/lib/client/import-deck/toActionlist";

export function ImportDialog({
    player,
}: {
    player: ShahrazadPlaymatId | null;
}) {
    const { importFor } = useImportContext();
    const { applyAction, getPlaymat, getZone, active_player, settings } =
        useShahrazadGameContext();
    const [deckstr, setDeckstr] = useState<string>("");
    const [url, setUrl] = useState("");
    const urlRef = useRef("");
    const [loading, _setLoading] = useState(false);
    const loadingRef = useRef(false);

    const open = player !== null;
    const playmat = player !== null ? getPlaymat(player) : null;

    function close() {
        importFor(null);
    }

    function setLoading(l: boolean) {
        _setLoading(l);
        loadingRef.current = l;
    }

    async function importDeck(url: string, reset = true) {
        if (player === null) return false;
        const playmat = getPlaymat(player);
        if (!playmat) return false;
        if (loadingRef.current) {
            return false;
        }
        loadingRef.current = true;
        let deck: IParsedDeck | null | undefined;
        setLoading(true);
        const locations = {
            deckId: playmat.library,
            sideboardId: playmat.sideboard,
            commandId: playmat.command,
            playerId: player,
        };
        if (url) {
            const deckPromise = importFromUrl(url).then((deck) => {
                if (!deck) throw { message: "Couldn't fetch deck" };
                return deck;
            });
            toast.promise(deckPromise, {
                loading: "Fetching deck...",
                success: ({ deck_data: { name } }) =>
                    `Imported deck "${name.substring(0, 20)}${name.length > 20 ? "..." : ""}"`,
                error: "Couldn't fetch deck",
            });
            try {
                deck = (await deckPromise).cards;
            } catch {}
        } else if (deckstr) {
            deck = importFromStr(deckstr);
            if (deck === undefined) {
                toast.error("Couldn't parse deck.");
                return;
            }
        }
        setLoading(false);
        if (!deck) {
            return;
        }

        const actions = toActionList(deck, locations);
        if (!actions) {
            toast.error("No cards to load.");
            return;
        }
        const hasCommander =
            deck.commander.length !== 0 && deck.commander.length <= 2;
        if (hasCommander && !settings.commander) {
            // eslint-disable-next-line prefer-const
            let id: string | number;
            const change = () => {
                applyAction({
                    type: ShahrazadActionCase.SetSettings,
                    settings: { ...settings, commander: true },
                });
                toast.success("Switched to commander.", {
                    id,
                    description: null,
                    action: (
                        <Button
                            className="h-9"
                            variant="destructive"
                            onClick={() => {
                                applyAction({
                                    type: ShahrazadActionCase.SetSettings,
                                    settings: { ...settings, commander: false },
                                });
                                warn();
                            }}
                        >
                            Undo
                        </Button>
                    ),
                });
            };
            const warn = () =>
                toast.warning("Detected commander.", {
                    description: "Change settings?",
                    action: (
                        <Button className="h-9" onClick={change}>
                            Commander
                        </Button>
                    ),
                });

            id = warn();
        }

        if (reset) {
            applyAction({
                type: ShahrazadActionCase.ClearBoard,
                player_id: player,
            });
        }
        actions.forEach((a) => applyAction(a));
        close();
        setLoading(false);
    }

    const isEmpty =
        playmat !== null && getZone(playmat.library).cards.length === 0;

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
                            Deck string,{" "}
                            <a
                                className="font-bold"
                                href="https://archidekt.com"
                                target="_blank"
                            >
                                Archidekt
                            </a>{" "}
                            link, or{" "}
                            <a
                                className="font-bold"
                                href="https://moxfield.com"
                                target="_blank"
                            >
                                Moxfield
                            </a>{" "}
                            link supported.
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        importDeck(urlRef.current);
                    }}
                >
                    <Label htmlFor="deck-url">Link</Label>
                    <Input
                        id="deck-url"
                        // placeholder="https://archidekt.com/decks/XXXX/XXXX"
                        placeholder="https://moxfield.com/decks/XXXX"
                        onChange={(e) => {
                            setUrl(e.target.value);
                            urlRef.current = e.target.value;
                        }}
                        onFocus={(e) => e.target.select()}
                        value={url}
                    />
                </form>
                <SavedDecks importDeck={importDeck} />

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
                <div className="flex gap-4">
                    <Button
                        className="grow"
                        disabled={(!url && !deckstr) || loading}
                        onClick={() => importDeck(urlRef.current, false)}
                    >
                        {loading
                            ? "Loading..."
                            : isEmpty
                              ? "Import"
                              : "Import Without Replacing"}
                    </Button>
                    {!isEmpty && (
                        <Button
                            className="grow"
                            variant="destructive"
                            disabled={(!url && !deckstr) || loading}
                            onClick={() => {
                                if (player === null) return;

                                importDeck(urlRef.current);
                            }}
                        >
                            {loading ? "Loading..." : "Clear + Import"}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
