import CardSpread from "@/contexts/search/search-zone";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerTitle,
} from "@/components/(ui)/drawer";
import { ShahrazadCardId } from "@/types/bindings/card";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from "react";

export interface ISearchContext {
    search: (zone: ShahrazadZoneId) => void;
    active: ShahrazadZoneId | null;
}

const SearchContext = createContext<ISearchContext | null>(null);

export function useSearchContext() {
    const context = useContext(SearchContext);
    if (context === null) {
        throw Error("cannot used searchContext() outside context");
    }
    return context;
}

export function SearchContextProvider({ children }: { children: ReactNode }) {
    const [searchZone, setSearchZone] = useState<ShahrazadCardId | null>(null);
    const search = useCallback((zone: ShahrazadZoneId) => {
        setSearchZone(zone);
    }, []);

    const open = searchZone !== null;

    return (
        <SearchContext.Provider value={{ search, active: searchZone }}>
            {children}
            {
                <Drawer
                    open={open}
                    onOpenChange={(open) => {
                        if (!open) {
                            setSearchZone(null);
                        }
                    }}
                >
                    <DrawerContent>
                        <VisuallyHidden>
                            <DrawerTitle>Searching</DrawerTitle>
                            <DrawerDescription>
                                Drag items into play
                            </DrawerDescription>
                        </VisuallyHidden>
                        {open && <CardSpread id={searchZone} />}
                    </DrawerContent>
                </Drawer>
            }
        </SearchContext.Provider>
    );
}
