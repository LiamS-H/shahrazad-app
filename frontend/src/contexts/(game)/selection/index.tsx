import { ShahrazadCardId } from "@/types/bindings/card";
import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

export interface ISelectionContext {
    selectedCards: ShahrazadCardId[];
    selectCards: (cards: ShahrazadCardId[] | null) => void;
    currentPreview: ShahrazadCardId | null;
    setPreview: (card: ShahrazadCardId | null | undefined) => void;
}

const SelectionContext = createContext<ISelectionContext | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
    const [selectedCards, setSelectedCards] = useState<ShahrazadCardId[]>([]);
    const shift_key_ref = useRef(false);

    const [currentPreview, setCurrentPreview] =
        useState<ShahrazadCardId | null>(null);
    const clearPreviewTimeout = useRef<NodeJS.Timeout | null>(null);

    const resetTimeout = useCallback(() => {
        if (clearPreviewTimeout.current) {
            clearTimeout(clearPreviewTimeout.current);
            clearPreviewTimeout.current = null;
        }
    }, []);

    const setPreview = useCallback(
        (card: ShahrazadCardId | null | undefined) => {
            if (card) {
                setCurrentPreview(card);
                resetTimeout();
                return;
            }
            if (card === undefined) {
                setCurrentPreview(null);
                resetTimeout();
            }
            if (clearPreviewTimeout.current) {
                return;
            }
            clearPreviewTimeout.current = setTimeout(() => {
                setCurrentPreview(null);
                resetTimeout();
            }, 1000);
        },
        [setCurrentPreview, resetTimeout]
    );

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.shiftKey) {
                shift_key_ref.current = true;
                return;
            }
            shift_key_ref.current = false;
        };

        const controller = new AbortController();

        window.addEventListener("keydown", handleKey, {
            signal: controller.signal,
        });
        window.addEventListener("keyup", handleKey, {
            signal: controller.signal,
        });

        return () => controller.abort();
    });

    const selectCards = useCallback((cards: ShahrazadCardId[] | null) => {
        if (cards === null) {
            setSelectedCards([]);
            return;
        }
        if (!shift_key_ref.current) {
            setSelectedCards(cards);
            return;
        }
        setSelectedCards((old_cards) => {
            const new_cards = [...old_cards];
            for (const card of cards) {
                if (new_cards.includes(card)) continue;
                new_cards.push(card);
            }
            return new_cards;
        });
    }, []);

    return (
        <SelectionContext.Provider
            value={{ selectedCards, selectCards, currentPreview, setPreview }}
        >
            {children}
        </SelectionContext.Provider>
    );
}

export function useSelection() {
    const context = useContext(SelectionContext);
    if (context === null) {
        throw Error("must use useSelection inside context");
    }
    return context;
}
