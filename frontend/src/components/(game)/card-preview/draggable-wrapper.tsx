import { Button } from "@/components/(ui)/button";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cx } from "class-variance-authority";
import { Grip } from "lucide-react";
import { type HTMLProps, type ReactNode } from "react";

export function DraggableWrapper({
    ref,
    className,
    children,
    pos: { x, y },
    ...props
}: Omit<HTMLProps<HTMLDivElement>, "style"> & {
    children: ReactNode;
    pos: {
        x: number;
        y: number;
    };
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: "preview",
        });

    return (
        <div
            className={cx("fixed group text-highlight p-4", className)}
            ref={(r) => {
                if (typeof ref === "function") {
                    ref(r);
                } else if (ref) {
                    ref.current = r;
                }
                setNodeRef(r);
            }}
            style={{
                transform: CSS.Translate.toString(transform),
                left: x,
                top: y,
                zIndex: isDragging ? 70 : undefined,
            }}
            {...props}
        >
            <div className="relative">
                {children}
                <Button
                    className="absolute -top-4 -left-4 cursor-grab "
                    size="icon"
                    variant="outline"
                    {...listeners}
                    {...attributes}
                >
                    <Grip />
                </Button>
            </div>
        </div>
    );
}
