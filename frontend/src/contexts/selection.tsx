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
    selectCards: (cards: ShahrazadCardId[]) => void;
}

const SelectionContext = createContext<ISelectionContext | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
    const [selectedCards, setSelectedCards] = useState<ShahrazadCardId[]>([]);
    const shift_key_ref = useRef(false);

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

    const selectCards = useCallback((cards: ShahrazadCardId[]) => {
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
        <SelectionContext.Provider value={{ selectedCards, selectCards }}>
            {children}
        </SelectionContext.Provider>
    );
}

export const useSelection = () => {
    const context = useContext(SelectionContext);
    if (context === null) {
        throw Error("must use useSelection inside context");
    }
    return context;
};
