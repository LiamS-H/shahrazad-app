import { ShahrazadCardId } from "@/types/bindings/card";
import { ShahrazadZoneId } from "@/types/bindings/zone";
import { createContext, useContext, useState, type ReactNode } from "react";
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
    const [searchZone, search] = useState<ShahrazadCardId | null>(null);

    return (
        <SearchContext.Provider value={{ search, active: searchZone }}>
            {children}
            <SearchDrawer />
        </SearchContext.Provider>
    );
}
