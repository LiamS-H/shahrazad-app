import { GameClientOnMessage } from "@/lib/client";
import {
    ShahrazadActionCase,
    ShahrazadActionCaseSendMessage,
} from "@/types/bindings/action";
import { MessageCase } from "@/types/bindings/message";
import { IArrowMessage, IMessage } from "@/types/interfaces/message";
import {
    createContext,
    Dispatch,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { useShahrazadGameContext } from "./game";

export type IMessageAction = Omit<
    Omit<ShahrazadActionCaseSendMessage, "created_at">,
    "type"
>;

interface IMessagesContext {
    messages: readonly IMessage[];
    arrows: readonly IArrowMessage[];
    sendMessage: (props: IMessageAction) => void;
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const messagesContext = createContext<null | IMessagesContext>(null);

export function useMessagesContext() {
    const context = useContext(messagesContext);
    if (!context) {
        throw Error("useMessagesContext() must be used within provider");
    }
    return context;
}

export function MessagesContextProvider({
    children,
    registerOnMessage,
}: {
    children: ReactNode;
    registerOnMessage: (onMessage: GameClientOnMessage) => void;
}) {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [arrows, setArrows] = useState<IArrowMessage[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const { applyAction, created_at } = useShahrazadGameContext();

    useEffect(() => {
        registerOnMessage((event) => {
            const new_messages: IMessage[] = [];
            const new_arrows: IArrowMessage[] = [];
            for (const message of event.messages) {
                switch (message.type) {
                    case MessageCase.DiceRoll:
                        new_messages.push({
                            created_at: event.created_at,
                            message,
                            sender: event.player_id,
                        });
                        continue;
                    case MessageCase.Arrow:
                        new_arrows.push({
                            created_at: event.created_at,
                            message,
                            sender: event.player_id,
                        });
                        continue;
                }
            }
            setMessages((old) => [...old, ...new_messages]);
            setArrows((old) => [...old, ...new_arrows]);
        });
    }, [registerOnMessage]);

    const curSecs = useCallback(() => {
        return Number(
            BigInt(Math.floor(Date.now() / 1000)) - (created_at as bigint)
        );
    }, [created_at]);

    useEffect(() => {
        let timerId: NodeJS.Timeout;

        const cleanup = () => {
            const currentSeconds = curSecs();
            setArrows((oldArrows) => {
                if (oldArrows.length === 0) return oldArrows;
                return oldArrows.filter(
                    (arrow) => arrow.created_at + 5 > currentSeconds
                );
            });
        };

        const offset = Date.now() % 1000;
        const delay = offset === 0 ? 0 : 1000 - offset;

        timerId = setTimeout(() => {
            cleanup();
            timerId = setInterval(cleanup, 1000);
        }, delay);

        return () => {
            if (timerId) {
                clearInterval(timerId);
            }
        };
    }, [curSecs]);

    const sendMessage = useCallback(
        (m: IMessageAction) => {
            applyAction({
                ...m,
                type: ShahrazadActionCase.SendMessage,
                created_at: curSecs(),
            });
        },
        [applyAction, curSecs]
    );

    return (
        <messagesContext.Provider
            value={{ messages, arrows, sendMessage, isOpen, setIsOpen }}
        >
            {children}
        </messagesContext.Provider>
    );
}
