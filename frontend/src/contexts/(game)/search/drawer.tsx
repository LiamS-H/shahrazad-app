import { useSearchContext } from ".";
import SearchZone from "@/components/(game)/search-zone";
import { useEffect, useState } from "react";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { Drawer2 } from "@/components/(ui)/drawer2";

export default function SearchDrawer() {
    const { active, search } = useSearchContext();
    const [lastActive, setLastActive] = useState<ShahrazadZoneId | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (active === null) {
            setOpen(false);
            return;
        }
        setLastActive(active);
        setOpen(true);
        const controller = new AbortController();
        window.addEventListener(
            "keydown",
            (e) => {
                if (e.key == "Escape") {
                    setOpen(false);
                    search(null);
                    controller.abort();
                }
            },
            { signal: controller.signal }
        );

        return () => controller.abort();
    }, [active, search]);
    return (
        <Drawer2
            open={open}
            onOpenChange={(open) => {
                if (!open) {
                    search(null);
                    setOpen(open);
                }
            }}
        >
            {lastActive && <SearchZone id={lastActive} />}
        </Drawer2>
    );
}
