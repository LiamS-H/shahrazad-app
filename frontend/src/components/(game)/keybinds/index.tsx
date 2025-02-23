import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/(ui)/command";
import { DialogTitle } from "@/components/(ui)/dialog";
import { KeyShortcut } from "@/components/(ui)/key-shortcut";
import { VisuallyHidden } from "@/components/(ui)/visually-hidden";

import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { useImportContext } from "@/contexts/(game)/import";
import { useSearchContext } from "@/contexts/(game)/search";
import { useDevice } from "@/contexts/device";
import { randomU64 } from "@/lib/utils/random";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function Keybinds() {
    const { active_player, applyAction, getPlaymat, getZone } =
        useShahrazadGameContext();
    const { search, active } = useSearchContext();
    const { importFor } = useImportContext();

    const playmat = getPlaymat(active_player);
    const device = useDevice();

    const isDeckEmpty = getZone(playmat.library).cards.length === 0;

    const deckDraw = useCallback(() => {
        if (isDeckEmpty) {
            toast("Can't draw from empty deck.");
            return;
        }
        if (active !== null) {
            toast("Can't draw cards while searching.");
            return;
        }
        applyAction({
            type: ShahrazadActionCase.DrawTop,
            amount: 1,
            destination: playmat.hand,
            source: playmat.library,
            state: {
                face_down: true,
                revealed: [active_player],
            },
        });
        setOpen(false);
        toast("Drawing Card.");
    }, [
        playmat.library,
        playmat.hand,
        active_player,
        active,
        isDeckEmpty,
        applyAction,
    ]);

    const deckSearch = useCallback(() => {
        if (isDeckEmpty) {
            toast("Can't search empty deck.");
            return;
        }
        if (active === playmat.library) {
            search(null);
        } else {
            search(playmat.library);
        }
        setOpen(false);
    }, [playmat.library, active, isDeckEmpty, search]);

    const deckShuffle = useCallback(() => {
        if (isDeckEmpty) {
            toast("Can't shuffle empty deck.");
            return;
        }
        applyAction({
            type: ShahrazadActionCase.Shuffle,
            seed: randomU64(),
            zone: playmat.library,
        });
        toast("Deck shuffled.");
    }, [playmat.library, isDeckEmpty, applyAction]);

    const deckImport = useCallback(() => {
        importFor(active_player);
    }, [importFor, active_player]);

    const [open, setOpen] = useState(false);
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (!e.metaKey && device === "OSX") {
                return;
            }
            if (!e.ctrlKey && device === "notOSX") {
                return;
            }
            switch (e.key) {
                case "k":
                    e.preventDefault();
                    setOpen((open) => !open);
                    return;
                case "d":
                    e.preventDefault();
                    deckDraw();
                    setOpen(false);
                    return;
                case "f":
                    e.preventDefault();
                    deckSearch();
                    setOpen(false);
                    return;
                case "s":
                    e.preventDefault();
                    deckShuffle();
                    setOpen(false);
                    return;
                case "i":
                    e.preventDefault();
                    deckImport();
                    setOpen(false);
                    return;
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [device, deckDraw, deckImport, deckSearch, deckShuffle]);

    return (
        <CommandDialog
            onOpenChange={setOpen}
            open={open}
            aria-description="test"
        >
            <VisuallyHidden>
                <DialogTitle>Commands</DialogTitle>
            </VisuallyHidden>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Deck">
                    <CommandItem disabled={!isDeckEmpty}>
                        Import
                        <CommandShortcut>
                            <KeyShortcut keys={["Ctrl", "I"]} />
                        </CommandShortcut>
                    </CommandItem>
                    <CommandItem disabled={isDeckEmpty}>
                        Search
                        <CommandShortcut>
                            <KeyShortcut keys={["Ctrl", "F"]} />
                        </CommandShortcut>
                    </CommandItem>
                    <CommandItem disabled={isDeckEmpty}>
                        Draw
                        <CommandShortcut>
                            <KeyShortcut keys={["Ctrl", "D"]} />
                        </CommandShortcut>
                    </CommandItem>
                    <CommandItem disabled={isDeckEmpty}>
                        Shuffle
                        <CommandShortcut>
                            <KeyShortcut keys={["Ctrl", "S"]} />
                        </CommandShortcut>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
            </CommandList>
        </CommandDialog>
    );
}
