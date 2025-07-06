import { useShahrazadGameContext } from "@/contexts/(game)/game";
import {
    ArrowType,
    MessageCase,
    MessageCaseArrow,
} from "@/types/bindings/message";
import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    // useMemo,
    useRef,
    useState,
} from "react";
import { useMessagesContext } from "../messages";
import { ShahrazadCardId } from "@/types/bindings/card";

interface IArrowsContext {
    isActive: boolean;
    active: ShahrazadCardId | null;
}

const arrowsContext = createContext<null | IArrowsContext>(null);

export function useArrowsContext() {
    const context = useContext(arrowsContext);
    if (!context) {
        throw Error("useMessagesContext() must be used within provider");
    }
    return context;
}

export function ArrowsContextProvider({ children }: { children: ReactNode }) {
    const { active_player } = useShahrazadGameContext();
    const { sendMessage } = useMessagesContext();

    const source_card = useRef<null | ShahrazadCardId>(null);
    const [active, _setActive] = useState<ShahrazadCardId | null>(null);
    const setActive = useCallback(
        (id: ShahrazadCardId | null) => {
            _setActive(id);
            source_card.current = id;
        },
        [_setActive]
    );

    const addArrow = useCallback(
        (message: Omit<Omit<MessageCaseArrow, "type">, "from">) => {
            if (!source_card.current) {
                return;
            }
            sendMessage({
                player_id: active_player,
                messages: [
                    {
                        ...message,
                        type: MessageCase.Arrow,
                        from: source_card.current,
                    },
                ],
            });
            setActive(null);
        },
        [sendMessage, active_player, setActive]
    );

    useEffect(() => {
        const controller = new AbortController();
        const options = {
            signal: controller.signal,
        };
        window.addEventListener(
            "mousedown",
            (event) => {
                if (event.button !== 2) {
                    setActive(null);
                    return;
                }
                let cur: EventTarget | null = event.target;
                while (cur && cur instanceof Element) {
                    if (!(cur instanceof HTMLElement)) {
                        cur = cur.parentElement;
                        continue;
                    }
                    if (cur.dataset.shahcard) {
                        setActive(cur.dataset.shahcard);
                        return;
                    }
                    cur = cur.parentElement;
                }
            },
            options
        );
        window.addEventListener(
            "contextmenu",
            (event) => {
                if (event.button !== 2) {
                    setActive(null);
                    return;
                }
                let cur: EventTarget | null = event.target;
                while (cur && cur instanceof Element) {
                    if (!(cur instanceof HTMLElement)) {
                        cur = cur.parentElement;
                        continue;
                    }
                    if (cur.dataset.shahcard) {
                        if (cur.dataset.shah_card === source_card.current) {
                            setActive(null);
                            return;
                        }
                        event.preventDefault();
                        event.stopPropagation();
                        addArrow({
                            arrow_type: ArrowType.CARD,
                            to: cur.dataset.shahcard,
                        });
                        return;
                    }
                    if (cur.dataset.shahzone) {
                        event.preventDefault();
                        event.stopPropagation();
                        addArrow({
                            arrow_type: ArrowType.ZONE,
                            to: cur.dataset.shahzone,
                        });
                        return;
                    }
                    if (cur.dataset.shahplayer) {
                        event.preventDefault();
                        event.stopPropagation();
                        addArrow({
                            arrow_type: ArrowType.PLAYER,
                            to: cur.dataset.shahplayer,
                        });
                        return;
                    }
                    cur = cur.parentElement;
                }
                setActive(null);
            },
            options
        );
        return () => controller.abort();
    }, [addArrow, setActive]);

    return (
        <arrowsContext.Provider value={{ isActive: active !== null, active }}>
            {children}
        </arrowsContext.Provider>
    );
}
