import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerTitle,
} from "@/components/(ui)/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useSearchContext } from ".";
import SearchZone from "@/components/(game)/search-zone/search-zone";

export default function SearchDrawer() {
    const { active, search } = useSearchContext();

    const open = active !== null;
    return (
        <Drawer
            open={open}
            onOpenChange={(open) => {
                if (!open) {
                    search(null);
                }
            }}
        >
            <DrawerContent>
                <VisuallyHidden>
                    <DrawerTitle>Searching</DrawerTitle>
                    <DrawerDescription>Drag items into play</DrawerDescription>
                </VisuallyHidden>
                {open && <SearchZone id={active} />}
            </DrawerContent>
        </Drawer>
    );
}
