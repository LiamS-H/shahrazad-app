import { ContextMenuItem } from "@/components/(game)/(context-menus)/context-menu";
import { Input } from "@/components/(ui)/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import type { ShahrazadCard, ShahrazadCardId } from "@/types/bindings/card";
import { useState } from "react";

export function Annotate({
    shah_card,
    cards,
}: {
    shah_card: ShahrazadCard;
    cards: ShahrazadCardId[];
}) {
    const { applyAction } = useShahrazadGameContext();
    const [annotation, setAnnotation] = useState(
        shah_card.state.annotation ?? ""
    );
    const [open, setOpen] = useState(false);

    function annotate() {
        if (annotation === shah_card.state.annotation) return;
        applyAction({
            type: ShahrazadActionCase.CardState,
            cards,
            state: {
                annotation,
            },
        });
    }

    return (
        <Popover
            open={open}
            onOpenChange={(o) => {
                setOpen(o);
                if (o) {
                    setAnnotation(annotation);
                } else {
                    annotate();
                }
            }}
        >
            <PopoverTrigger asChild>
                <ContextMenuItem
                    onClick={(e) => {
                        setOpen(true);
                        e.preventDefault();
                    }}
                    onPointerMove={(e) => {
                        if (!open) return;
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                    onPointerLeave={(e) => {
                        if (!open) return;
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    Annotate
                </ContextMenuItem>
            </PopoverTrigger>
            <PopoverContent>
                <form
                    onSubmit={(e) => {
                        annotate();
                        e.preventDefault();
                        setOpen(false);
                    }}
                >
                    <Input
                        value={annotation}
                        onChange={(e) => setAnnotation(e.target.value)}
                    />
                </form>
            </PopoverContent>
        </Popover>
    );
}
