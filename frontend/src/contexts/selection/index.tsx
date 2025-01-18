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
import Preview from "./preview";

export interface ISelectionContext {
    selectedCards: ShahrazadCardId[];
    selectCards: (cards: ShahrazadCardId[] | null) => void;
    currentPreview: ShahrazadCardId | null;
    setPreview: (card: ShahrazadCardId | null) => void;
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
        (card: ShahrazadCardId | null) => {
            if (card !== null) {
                setCurrentPreview(card);
                resetTimeout();
                return;
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

        document.addEventListener("keydown", handleKey);
        document.addEventListener("keyup", handleKey);
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
            <Preview />
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
