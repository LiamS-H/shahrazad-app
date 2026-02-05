import { MessageArrows } from "@/components/(game)/arrow/message";
import { useArrowsContext } from "@/contexts/(game)/arrows";
import { useMessagesContext } from "@/contexts/(game)/messages";
import { ActiveArrow } from "./active";
import { RefObject, useCallback, useEffect, useState } from "react";
import { pos } from "./bezier-arrow";

export function Arrows({
    parentRef,
}: {
    parentRef: RefObject<HTMLDivElement | null>;
}) {
    const { arrows } = useMessagesContext();
    const { active } = useArrowsContext();

    const [offset, setOffset] = useState<pos>({ x: 0, y: 0 });

    const updateOffset = useCallback(() => {
        if (!parentRef.current) return;
        const rect = parentRef.current.getBoundingClientRect();
        if (!rect) return;
        setOffset({
            x: parentRef.current.scrollLeft - rect.x,
            y: parentRef.current.scrollTop - rect.y,
        });
    }, [parentRef]);

    useEffect(() => {
        const controller = new AbortController();
        if (!parentRef.current) {
            return;
        }
        updateOffset();
        parentRef.current.addEventListener(
            "scroll",
            () => {
                updateOffset();
            },
            { signal: controller.signal },
        );
        return () => controller.abort();
    }, [parentRef, updateOffset]);

    return (
        <>
            {active && <ActiveArrow source_id={active} offset={offset} />}
            <MessageArrows messages={arrows} offset={offset} />
        </>
    );
}
