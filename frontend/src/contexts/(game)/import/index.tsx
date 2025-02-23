import { ImportDialog } from "@/components/(game)/import-dialog";
import { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useState,
} from "react";

interface IImportContext {
    importFor: (player: ShahrazadPlaymatId | null) => void;
}

const ImportContext = createContext<IImportContext | null>(null);

export function ImportContextProvider({ children }: { children: ReactNode }) {
    const [active, setActive] = useState<ShahrazadPlaymatId | null>(null);

    const importFor = useCallback((player: ShahrazadPlaymatId | null) => {
        setActive(player);
    }, []);

    return (
        <ImportContext.Provider value={{ importFor }}>
            {children}
            {active && <ImportDialog player={active} />}
        </ImportContext.Provider>
    );
}

export function useImportContext() {
    const context = useContext(ImportContext);
    if (!context) {
        throw Error("useImportContext must be used in context.");
    }
    return context;
}
