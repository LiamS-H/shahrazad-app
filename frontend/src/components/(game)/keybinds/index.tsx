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
import { useSearchContext } from "@/contexts/(game)/search";
import { useDevice } from "@/contexts/device";
import { randomU64 } from "@/lib/utils/random";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function Keybinds() {
    const { active_player, applyAction, getPlaymat } =
        useShahrazadGameContext();
    const { search, active } = useSearchContext();

    const playmat = getPlaymat(active_player);
    const device = useDevice();

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
                    return;
                case "f":
                    e.preventDefault();
                    if (active === playmat.library) {
                        search(null);
                    } else {
                        search(playmat.library);
                    }
                    setOpen(false);
                    return;
                case "s":
                    e.preventDefault();
                    applyAction({
                        type: ShahrazadActionCase.Shuffle,
                        seed: randomU64(),
                        zone: playmat.library,
                    });
                    toast("Deck shuffled.");
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [
        active,
        device,
        playmat.hand,
        playmat.library,
        search,
        active_player,
        applyAction,
    ]);

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
                    <CommandItem>
                        Search
                        <CommandShortcut>
                            <KeyShortcut keys={["Ctrl", "F"]} />
                        </CommandShortcut>
                    </CommandItem>
                    <CommandItem>
                        Draw
                        <CommandShortcut>
                            <KeyShortcut keys={["Ctrl", "D"]} />
                        </CommandShortcut>
                    </CommandItem>
                    <CommandItem>
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
