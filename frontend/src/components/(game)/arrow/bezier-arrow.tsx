import React, { useId } from "react";

export interface pos {
    x: number;
    y: number;
}

export function BezierArrow({ from, to }: { from: pos; to: pos }) {
    const id = useId();
    const arrowheadId = `arrowhead-${id}`;
    const filterId = `filter-${id}`;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) {
        return null;
    }

    // calculate control point for the quadratic bezier curve
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const p_dx = -dy / length;
    const p_dy = dx / length;
    const offset = 100;
    const controlX = midX + offset * p_dx;
    const controlY = midY + offset * p_dy;

    const pathD = `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;

    return (
        // <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-[1001]">
        <svg className="absolute pointer-events-none overflow-visible z-[1001]">
            <defs>
                <filter
                    id={filterId}
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                >
                    <feDropShadow
                        dx="0"
                        dy="0"
                        stdDeviation="2"
                        floodColor="white"
                    />
                </filter>
                <marker
                    id={arrowheadId}
                    markerWidth="20"
                    markerHeight="7"
                    refX="5"
                    refY="3.5"
                    orient="auto"
                >
                    <polygon
                        className="fill-highlight"
                        points="0 0, 10 3.5, 0 7"
                    />
                </marker>
            </defs>
            <path
                d={pathD}
                className="stroke-highlight"
                strokeWidth="4"
                fill="none"
                markerEnd={`url(#${arrowheadId})`}
                filter={`url(#${filterId})`}
            />
        </svg>
    );
}
