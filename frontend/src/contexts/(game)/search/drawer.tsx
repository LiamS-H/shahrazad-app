// import {
//     Drawer,
//     DrawerContent,
//     DrawerDescription,
//     DrawerTitle,
// } from "@/components/(ui)/drawer";
// import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useSearchContext } from ".";
import SearchZone from "@/components/(game)/search-zone";
import { useEffect, useState } from "react";
import { ShahrazadZoneId } from "@/types/bindings/zone";
// import { Button } from "@/components/(ui)/button";
// import { X } from "lucide-react";
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

    // return (
    //     <Drawer
    //         open={open}
    //         onOpenChange={(open) => {
    //             if (!open) {
    //                 search(null);
    //                 setOpen(open);
    //             }
    //         }}
    //     >
    //         <DrawerContent>
    //             <VisuallyHidden>
    //                 <DrawerTitle>Searching</DrawerTitle>
    //                 <DrawerDescription>Drag items into play</DrawerDescription>
    //             </VisuallyHidden>
    //             {lastActive && <SearchZone id={lastActive} />}
    //         </DrawerContent>
    //     </Drawer>
    // );
}
