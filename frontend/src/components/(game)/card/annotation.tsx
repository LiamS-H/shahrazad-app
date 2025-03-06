import { Input } from "@/components/(ui)/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";
import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import type { ShahrazadCardId } from "@/types/bindings/card";
import { useState } from "react";

export function Annotation({ id }: { id: ShahrazadCardId }) {
    const { getCard, applyAction } = useShahrazadGameContext();
    const shah_card = getCard(id);
    const [annotation, setAnnotation] = useState(
        shah_card.state.annotation ?? ""
    );

    const [open, setOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    if (!shah_card.state.annotation) return null;

    let disp_text = shah_card.state.annotation;

    if (shah_card.state.annotation.length > 10 && !isHovered) {
        disp_text = `${shah_card.state.annotation.slice(0, 10)}...`;
    }

    function annotate() {
        if (annotation === shah_card.state.annotation) return;
        applyAction({
            type: ShahrazadActionCase.CardState,
            cards: [id],
            state: {
                annotation,
            },
        });
    }

    return (
        <div className="absolute top-8 w-full p-2 flex justify-center">
            <Popover
                open={open}
                onOpenChange={(o) => {
                    setOpen(o);
                    if (o) {
                        setAnnotation(shah_card.state.annotation ?? "");
                    } else {
                        annotate();
                    }
                }}
            >
                <PopoverTrigger
                    className="bg-secondary rounded-sm text-xs w-fit p-1 max-w-md"
                    onPointerLeave={() => setIsHovered(false)}
                    onPointerOver={() => setIsHovered(true)}
                >
                    {disp_text}
                </PopoverTrigger>
                <PopoverContent>
                    <form
                        onSubmit={(e) => {
                            annotate();
                            e.preventDefault();
                        }}
                    >
                        <Input
                            value={annotation}
                            onChange={(e) => {
                                setAnnotation(e.target.value);
                            }}
                        />
                    </form>
                </PopoverContent>
            </Popover>
        </div>
    );
}
