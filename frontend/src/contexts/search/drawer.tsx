import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerTitle,
} from "@/components/(ui)/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useSearchContext } from ".";
import SearchZone from "@/components/(game)/search-zone/search-zone";
import { useEffect, useState } from "react";
import { ShahrazadZoneId } from "@/types/bindings/zone";

export default function SearchDrawer() {
    const { active, search } = useSearchContext();
    const [lastActive, setLastActive] = useState<ShahrazadZoneId | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (active !== null) {
            setLastActive(active);
            setOpen(true);
        }
    }, [active]);

    return (
        <Drawer
            open={open}
            onOpenChange={(open) => {
                if (!open) {
                    search(null);
                    setOpen(false);
                }
            }}
        >
            <DrawerContent>
                <VisuallyHidden>
                    <DrawerTitle>Searching</DrawerTitle>
                    <DrawerDescription>Drag items into play</DrawerDescription>
                </VisuallyHidden>

                {lastActive && <SearchZone id={lastActive} />}
            </DrawerContent>
        </Drawer>
    );
}
