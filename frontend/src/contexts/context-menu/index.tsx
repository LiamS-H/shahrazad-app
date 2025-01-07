import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import ZoneMenu from "./zone";
import CardMenu from "./card";
import { ShahrazadCardId } from "@/types/bindings/card";
import { ShahrazadZoneId } from "@/types/bindings/zone";

interface ContextMenuContext {
    showContextMenu: (arg0: MenuType, arg1: string) => void;
}

type MenuType = "zone" | "card" | "board";

const contextMenuContext = createContext<ContextMenuContext | null>(null);

export function useContextMenuContext(): ContextMenuContext {
    const context = useContext(contextMenuContext);
    if (context == null) {
        throw Error("useContextMenuContext() muse be used inside the context.");
    }
    return context;
}

export function ContextMenu({ children }: { children: ReactNode }) {
    const [targetType, setTargetType] = useState<MenuType | null>(null);
    const [targetId, setTargetId] = useState<string | null>(null);

    function handleRightClick(event: MouseEvent) {
        // event.preventDefault();
    }

    function showContextMenu(type: MenuType, target: string) {
        setTargetType(type);
        setTargetId(target);
    }

    useEffect(() => {
        window.addEventListener("contextmenu", handleRightClick);
        return () => {
            window.removeEventListener("contextmenu", handleRightClick);
        };
    }, []);

    let menu: ReactNode;
    if (targetType == null || targetId == null) {
        menu = null;
    } else if (targetType == "zone") {
        menu = <ZoneMenu zoneId={targetId} />;
    } else if (targetType == "card") {
        menu = <CardMenu cardId={targetId} />;
    }
    return (
        <contextMenuContext.Provider
            value={{
                showContextMenu,
            }}
        >
            {children}
            {menu}
        </contextMenuContext.Provider>
    );
}
