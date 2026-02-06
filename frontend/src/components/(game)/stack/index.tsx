import { useShahrazadGameContext, useZone } from "@/contexts/(game)/game";
import { PoppedOutZone } from "../out-zone";
import { useState } from "react";
import { Button } from "@/components/(ui)/button";
import { CopyX, LayersPlus } from "lucide-react";

export function StackButton() {
    const { stack } = useShahrazadGameContext();
    const {
        cards: { length },
    } = useZone(stack);
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button
                variant="outline"
                size="icon"
                onClick={() => setOpen((o) => !o)}
                className={`relative ${length !== 0 ? "text-highlight" : ""}`}
            >
                {open ? <CopyX /> : <LayersPlus />}
                {length !== 0 && !open && (
                    <div className="rounded-full w-6 h-6 flex justify-center items-center absolute -bottom-3 -right-3 bg-highlight text-highlight-foreground">
                        {length}
                    </div>
                )}
            </Button>
            <PoppedOutZone
                hidden={!open}
                id={stack}
                name="Stack"
                pos={{
                    x: window.innerWidth - 500,
                    y: 80,
                }}
                key="test"
                onClose={() => setOpen(false)}
            />
        </>
    );
}
