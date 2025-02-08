import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { useSelection } from "@/contexts/(game)/selection";
import type { ShahrazadCard, ShahrazadCardId } from "@/types/bindings/card";

import { GRID_SIZE } from ".";
import { clamp } from "@/lib/utils/clamp";

interface SelectionBounds {
    left: number;
    width: number;
    top: number;
    height: number;
}
export default function Selection({
    node,
    cards,
}: {
    node: RefObject<HTMLElement | null>;
    cards: { card: ShahrazadCard; id: ShahrazadCardId }[];
}) {
    const [selectionBounds, setSelectionBounds] =
        useState<SelectionBounds | null>(null);
    const bounds_ref = useRef(selectionBounds);
    const { selectCards, setPreview } = useSelection();

    const handleMouseDown = useCallback(
        (e: MouseEvent) => {
            if (e.target !== e.currentTarget) return;
            if (!node.current) return;
            setPreview(undefined);

            const boardRect = node.current.getBoundingClientRect();
            const startX = e.clientX - boardRect.x;
            const startY = e.clientY - boardRect.y;

            setSelectionBounds({
                left: startX,
                top: startY,
                width: 0,
                height: 0,
            });
            const handleMouseMove = (moveEvent: MouseEvent) => {
                if (!node.current) return;
                const rect = node.current.getBoundingClientRect();
                const currentX =
                    clamp(moveEvent.clientX, rect.x, rect.x + rect.width) -
                    rect.x;
                const currentY =
                    clamp(moveEvent.clientY, rect.y, rect.y + rect.height) -
                    rect.y;
                // const currentX = moveEvent.clientX - rect.x;
                // const currentY = moveEvent.clientY - rect.y;
                const newBounds = {
                    left: Math.min(startX, currentX),
                    top: Math.min(startY, currentY),
                    width: Math.abs(startX - currentX),
                    height: Math.abs(startY - currentY),
                };

                setSelectionBounds(newBounds);
                bounds_ref.current = newBounds;
            };

            const controller = new AbortController();
            const handleMouseUp = () => {
                controller.abort();
                setSelectionBounds(null);
                const bounds = bounds_ref.current;
                if (!bounds) {
                    return;
                }
                const new_selection = cards.filter(({ card }) => {
                    if (
                        card.state.x === undefined ||
                        card.state.y === undefined
                    )
                        return false;

                    const left = card.state.x * GRID_SIZE;
                    const right = left + 5 * GRID_SIZE;
                    const top = card.state.y * GRID_SIZE;
                    const bottom = top + 7 * GRID_SIZE;

                    if (right < bounds.left) return false;
                    if (left > bounds.left + bounds.width) return false;
                    if (bottom < bounds.top) return false;
                    if (top > bounds.top + bounds.height) return false;

                    return true;
                });
                selectCards(new_selection.map((c) => c.id));
                bounds_ref.current = null;
            };

            window.addEventListener("mousemove", handleMouseMove, {
                signal: controller.signal,
            });
            window.addEventListener("mouseup", handleMouseUp, {
                signal: controller.signal,
            });

            return () => controller.abort();
        },
        [cards, node, selectCards, setPreview]
    );

    useEffect(() => {
        if (!node.current) return;
        const nodeRef = node.current;
        const controller = new AbortController();
        nodeRef.addEventListener("mousedown", handleMouseDown, {
            signal: controller.signal,
        });
        return () => controller.abort();
    }, [cards, node, handleMouseDown]);

    if (!selectionBounds) return null;

    return (
        <div
            className="z-20 pointer-events-none absolute bg-blue-700/30"
            style={{
                left: selectionBounds.left,
                top: selectionBounds.top,
                width: selectionBounds.width,
                height: selectionBounds.height,
                border: "1px dashed blue",
            }}
        />
    );
}
