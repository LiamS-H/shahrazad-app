import { cn } from "@/lib/utils/tw-merge";
import {
    Triangle,
    Pentagon,
    Octagon,
    Circle,
    Square,
    Diamond,
    Badge,
    Hexagon,
} from "lucide-react";
import React from "react";

export function DiceIcon({
    sides,
    className,
}: {
    sides: number;
    className?: string;
}) {
    let Shape;
    switch (sides) {
        case 2:
            Shape = Circle;
            break;
        case 3:
            Shape = Square;
            break;
        case 4:
            Shape = Triangle;
            break;
        case 5:
            Shape = Pentagon;
        case 6:
            Shape = Square;
            break;
        case 8:
            Shape = Diamond;
            break;
        case 12:
            Shape = Hexagon;
            break;
        case 20:
            Shape = Octagon;
            break;
        default:
            Shape = Badge;
    }

    return (
        <div
            className={cn(
                "relative flex justify-center items-center",
                className
            )}
        >
            <Shape className="w-full h-full" strokeWidth={2} />
            <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
                <span className="flex text-xs font-bold">{sides}</span>
            </div>
        </div>
    );
}
