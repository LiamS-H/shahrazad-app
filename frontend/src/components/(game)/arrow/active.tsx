import { ShahrazadCardId } from "@/types/bindings/card";
import { useEffect, useRef, useState } from "react";
import { BezierArrow, pos } from "./bezier-arrow";
import { getMessageCenter } from "./message";
import { ArrowType } from "@/types/bindings/message";

export function ActiveArrow({
    source_id,
    offset,
}: {
    source_id: ShahrazadCardId;
    offset: pos;
}) {
    const [to, setTo] = useState<pos | null>();
    const [from, setFrom] = useState<pos | null>();

    const animationFrameRef = useRef<number>(0);

    useEffect(() => {
        const pos = getMessageCenter(ArrowType.CARD, source_id, offset);
        if (pos) {
            setFrom(pos);
        }
    }, [source_id, offset]);

    useEffect(() => {
        const controller = new AbortController();

        window.addEventListener("mousemove", (e) => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            animationFrameRef.current = requestAnimationFrame(() => {
                setTo({ x: offset.x + e.x, y: offset.y + e.y });
            });
        });

        return () => controller.abort();
    }, [offset]);

    if (!from || !to) {
        return null;
    }

    return <BezierArrow from={from} to={to} />;
}
