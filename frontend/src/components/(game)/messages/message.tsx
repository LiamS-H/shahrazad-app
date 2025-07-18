import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { MessageCase } from "@/types/bindings/message";
import { IMessage } from "@/types/interfaces/message";
import { DiceIcon } from "@/components/(ui)/dice";

export function Message({
    message,
    lastRoll,
}: {
    message: IMessage;
    lastRoll: number | null;
}) {
    const { getPlaymat } = useShahrazadGameContext();
    const sender = getPlaymat(message.sender)?.player.display_name || "System";

    switch (message.message.type) {
        case MessageCase.DiceRoll: {
            const { sides, result } = message.message;
            return (
                <div
                    className={`flex items-end gap-2 ${
                        lastRoll === sides ? "text-highlight" : ""
                    }`}
                >
                    <span className="font-bold">{sender}</span>
                    {sides === 2 ? (
                        <>
                            <span>
                                {" "}
                                {result === 1
                                    ? "won the flip"
                                    : "lost the flip"}
                            </span>
                            <span className="font-bold text-lg">{result}</span>
                        </>
                    ) : (
                        <>
                            <span>rolled a</span>
                            <span className="font-bold text-lg">{result}</span>
                        </>
                    )}
                    <DiceIcon className="h-8 w-8" sides={sides} />
                </div>
            );
        }
        default:
            return null;
    }
}
