import {
    ContextMenu,
    // ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    // ContextMenuRadioGroup,
    // ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    // ContextMenuSub,
    // ContextMenuSubContent,
    // ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useShahrazadGameContext } from "../../../contexts/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { type ReactNode, useState } from "react";
import { randomU64 } from "@/lib/random";
export default function DeckContextMenu({
    zoneId,
    children,
}: {
    zoneId: string;
    children: ReactNode;
}) {
    const { applyAction } = useShahrazadGameContext();
    const [open, setOpen] = useState(true);

    return (
        <ContextMenu modal={open} onOpenChange={setOpen}>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuLabel>Deck</ContextMenuLabel>
                <ContextMenuSeparator />
                <ContextMenuItem
                    onClick={() => {
                        applyAction({
                            type: ShahrazadActionCase.Shuffle,
                            zone: zoneId,
                            seed: randomU64(),
                        });
                    }}
                >
                    Shuffle
                    <ContextMenuShortcut>⌘S</ContextMenuShortcut>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
