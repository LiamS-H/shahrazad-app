import { Input } from "@/components/(ui)/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";
import { useCard, useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import type { ShahrazadCardId } from "@/types/bindings/card";
import { useCallback, useMemo, useState } from "react";

export function Annotation({ id }: { id: ShahrazadCardId }) {
    const { applyAction } = useShahrazadGameContext();
    const shah_card = useCard(id);
    const [annotation, setAnnotation] = useState(
        shah_card.state.annotation ?? ""
    );

    const [open, setOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const annotate = useCallback(() => {
        if (annotation === shah_card.state.annotation) return;
        applyAction({
            type: ShahrazadActionCase.CardState,
            cards: [id],
            state: {
                annotation,
            },
        });
    }, [annotation, shah_card.state.annotation, applyAction, id]);

    const disp_text = useMemo(() => {
        if (!shah_card.state.annotation) return null;
        if (shah_card.state.annotation.length > 10 && !isHovered) {
            return `${shah_card.state.annotation.slice(0, 10)}...`;
        }
        return shah_card.state.annotation;
    }, [isHovered, shah_card.state.annotation]);

    return useMemo(() => {
        if (!disp_text) return null;
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
                                setOpen(false);
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
    }, [open, annotate, annotation, shah_card.state.annotation, disp_text]);
}
