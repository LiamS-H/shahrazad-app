import { ImportDialog } from "@/components/(game)/import-dialog";
import { ShahrazadPlaymatId } from "@/types/bindings/playmat";
import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { useShahrazadGameContext } from "../game";

interface IImportContext {
    importFor: (player: ShahrazadPlaymatId | null) => void;
}

const ImportContext = createContext<IImportContext | null>(null);

export function ImportContextProvider({ children }: { children: ReactNode }) {
    const { active_player, getPlaymat, getZone } = useShahrazadGameContext();
    const [active, setActive] = useState<ShahrazadPlaymatId | null>(null);

    useEffect(() => {
        const playmat = getPlaymat(active_player);
        const defaultOpen =
            getZone(playmat.library).cards.length === 0 &&
            getZone(playmat.graveyard).cards.length === 0 &&
            getZone(playmat.exile).cards.length === 0 &&
            getZone(playmat.battlefield).cards.length === 0;
        if (defaultOpen) {
            setActive(active_player);
        }
    }, [active_player, getZone, getPlaymat]);
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
