import { ShahrazadCardId } from "@/types/bindings/card";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from "react";
import SearchDrawer from "./drawer";

export interface ISearchContext {
    search: (zone: ShahrazadZoneId | null) => void;
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
    const search = useCallback((zone: ShahrazadZoneId | null) => {
        setSearchZone(zone);
    }, []);

    return (
        <SearchContext.Provider value={{ search, active: searchZone }}>
            {children}
            <SearchDrawer />
        </SearchContext.Provider>
    );
}
