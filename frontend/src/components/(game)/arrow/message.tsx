import { ArrowType, MessageCaseArrow } from "@/types/bindings/message";
import { useCallback, useEffect, useRef, useState } from "react";
import { BezierArrow, pos } from "./bezier-arrow";
// import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { useDndContext } from "@dnd-kit/core";
import { IArrowMessage } from "@/types/interfaces/message";

export function getMessageCenter(
    type: MessageCaseArrow["arrow_type"],
    id: string,
    offset: pos,
): pos | null {
    let div;
    switch (type) {
        case ArrowType.CARD:
            div = document.querySelector(`[data-shahcard="${id}"]`);
            break;
        case ArrowType.ZONE:
            div = document.querySelector(`[data-shahzone="${id}"]`);
            break;
        case ArrowType.PLAYER:
            div = document.querySelector(`[data-shahplayer="${id}"]`);
            break;
    }

    if (!div) return null;

    const rect = div.getBoundingClientRect();

    return {
        x: offset.x + rect.x + rect.width / 2,
        y: offset.y + rect.y + rect.height / 2,
    };
}

export function MessageArrow({
    message,
    offset,
}: {
    message: MessageCaseArrow;
    offset: pos;
}) {
    const [chord, setChord] = useState<{ from: pos; to: pos } | null>(null);
    // const { getCard } = useShahrazadGameContext();
    const { active } = useDndContext();
    // const dragging = active !== null;

    const animationRef = useRef(0);

    const update = useCallback(() => {
        const from = getMessageCenter(message.arrow_type, message.from, offset);
        const to = getMessageCenter(message.arrow_type, message.to, offset);
        if (!from || !to) {
            return;
        }

        setChord({ from, to });
    }, [message, offset]);

    useEffect(() => {
        cancelAnimationFrame(animationRef.current);
        // if (
        //     active &&
        //     (active.id === message.from || active.id === message.to)
        // ) {
        const frame = () => {
            update();
            animationRef.current = requestAnimationFrame(frame);
        };
        animationRef.current = requestAnimationFrame(frame);
        // }
        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    }, [active, message, update]);

    if (!chord) {
        return null;
    }

    return <BezierArrow {...chord} />;
}

export function MessageArrows({
    messages,
    offset,
}: {
    messages: readonly IArrowMessage[];
    offset: pos;
}) {
    return messages.map((m, i) => (
        <MessageArrow message={m.message} key={i} offset={offset} />
    ));
}
