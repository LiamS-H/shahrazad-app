import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { useSelection } from "@/contexts/selection";
import type { ShahrazadCard, ShahrazadCardId } from "@/types/bindings/card";

import { GRID_SIZE } from ".";
import { clamp } from "@/lib/clamp";

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
    const { selectCards } = useSelection();

    const handleMouseDown = useCallback(
        (e: MouseEvent) => {
            if (e.target !== e.currentTarget) return;
            if (!node.current) return;

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

            const handleMouseUp = () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
                setSelectionBounds(null);
                const bounds = bounds_ref.current;
                if (!bounds) {
                    return;
                }
                const selectedCards = cards.filter((card) => {
                    if (!card.card.state.x || !card.card.state.y) return false;

                    const left = card.card.state.x * GRID_SIZE;
                    const right = left + 5 * GRID_SIZE;
                    const top = card.card.state.y * GRID_SIZE;
                    const bottom = top + 7 * GRID_SIZE;

                    if (right < bounds.left) return false;
                    if (left > bounds.left + bounds.width) return false;
                    if (bottom < bounds.top) return false;
                    if (top > bounds.top + bounds.height) return false;

                    return true;
                });
                console.log(selectedCards);
                selectCards(selectedCards.map((c) => c.id));
                bounds_ref.current = null;
            };

            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        },
        [cards]
    );

    useEffect(() => {
        if (!node.current) return;
        node.current.addEventListener("mousedown", handleMouseDown);
        return () => {
            if (!node.current) return;
            node.current.removeEventListener("mousedown", handleMouseDown);
        };
    }, [cards]);

    if (!selectionBounds) return null;

    return (
        <div
            style={{
                position: "absolute",
                left: selectionBounds.left,
                top: selectionBounds.top,
                width: selectionBounds.width,
                height: selectionBounds.height,
                backgroundColor: "rgba(0, 0, 255, 0.3)",
                border: "1px dashed blue",
                pointerEvents: "none",
                zIndex: 1000,
            }}
        />
    );
}
