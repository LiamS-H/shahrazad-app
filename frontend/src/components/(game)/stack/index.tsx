import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { PoppedOutZone } from "../out-zone";
import { useState } from "react";
import { Button } from "@/components/(ui)/button";
import { CopyX, LayersPlus } from "lucide-react";

export function StackButton() {
    const { stack } = useShahrazadGameContext();
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button
                variant="outline"
                size="icon"
                onClick={() => setOpen((o) => !o)}
            >
                {open ? <CopyX /> : <LayersPlus />}
            </Button>
            {open && (
                <PoppedOutZone
                    id={stack}
                    name="Stack"
                    pos={{
                        x: window.innerWidth - 300,
                        y: 80,
                    }}
                    key="test"
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}
