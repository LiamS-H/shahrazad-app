import { ShahrazadCardId } from "@/types/bindings/card";
import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

interface IDraggingContext {
    dragging: null | ShahrazadCardId[];
}

const DraggingContext = createContext<null | IDraggingContext>(null);

export function useDragging() {
    const context = useContext(DraggingContext);
    if (!context) {
        throw Error("useDragging must be used within context.");
    }
    return context;
}

export function DraggingContextProvider({
    children,
    dragging,
}: {
    children: ReactNode;
    dragging: null | ShahrazadCardId[];
}) {
    const [cards, setCards] = useState<null | ShahrazadCardId[]>(null);
    const timer = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        if (dragging) {
            clearTimeout(timer.current);
            timer.current = undefined;
            setCards(dragging);
            return;
        }
        if (!dragging) {
            clearTimeout(timer.current);
            timer.current = setTimeout(() => {
                setCards(null);
                clearTimeout(timer.current);
                timer.current = undefined;
            }, 0);
        }
    }, [dragging]);

    return (
        <DraggingContext.Provider value={{ dragging: cards }}>
            {children}
        </DraggingContext.Provider>
    );
}
