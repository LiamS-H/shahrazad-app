import { useCard, useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadActionCase } from "@/types/bindings/action";
import type { ShahrazadCardId } from "@/types/bindings/card";
import { useMemo, useState } from "react";
import { EditableText } from "@/components/(ui)/editable-text";

export function Annotation({ id }: { id: ShahrazadCardId }) {
    const { applyAction } = useShahrazadGameContext();
    const shah_card = useCard(id);

    const [isHovered, setIsHovered] = useState(false);

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
                <EditableText
                    value={shah_card.state.annotation ?? ""}
                    onSave={(val) => {
                        if (val !== shah_card.state.annotation) {
                            applyAction({
                                type: ShahrazadActionCase.CardState,
                                cards: [id],
                                state: {
                                    annotation: val,
                                },
                            });
                        }
                    }}
                    className="bg-secondary rounded-sm text-xs w-fit p-1 max-w-md cursor-pointer"
                    onPointerLeave={() => setIsHovered(false)}
                    onPointerOver={() => setIsHovered(true)}
                >
                    {disp_text}
                </EditableText>
            </div>
        );
    }, [disp_text, shah_card.state.annotation, applyAction, id]);
}
