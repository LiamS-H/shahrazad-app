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
        if (active !== null) {
            setLastActive(active);
            setOpen(true);
        }
        if (active === null) {
            setOpen(false);
        }
    }, [active]);
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
