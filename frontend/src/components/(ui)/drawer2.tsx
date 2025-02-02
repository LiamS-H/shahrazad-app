import { X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/(ui)/button";

export function Drawer2({
    open,
    onOpenChange,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
}) {
    const timeout = useRef<NodeJS.Timeout | undefined>(undefined);
    const [hidden, setHidden] = useState(false);
    useEffect(() => {
        clearTimeout(timeout.current);
        timeout.current = undefined;
        if (open) {
            setHidden(false);
        } else {
            timeout.current = setTimeout(() => {
                clearTimeout(timeout.current);
                timeout.current = undefined;
                setHidden(true);
            }, 100);
        }
    }, [open]);

    return (
        <div
            className="fixed bottom-0 pt-4 transition-transform border-secondary border-t-2 bg-background z-10 w-full h-fit"
            style={{
                transform: open ? undefined : "translate(0px,100%)",
            }}
        >
            <div className="relative">
                {!hidden && children}
                <Button
                    onClick={() => {
                        onOpenChange(false);
                    }}
                    className="absolute left-4 top-0"
                    size="icon"
                    variant="destructive"
                >
                    <X />
                </Button>
            </div>
        </div>
    );
}
