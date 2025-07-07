import { Message, MessageCaseArrow } from "@/types/bindings/message";
import { ShahrazadPlaymatId } from "@/types/bindings/playmat";

export interface IMessage {
    message: Exclude<Message, MessageCaseArrow>;
    created_at: number;
    sender: ShahrazadPlaymatId;
}

export type IArrowMessage = Omit<IMessage, "message"> & {
    message: MessageCaseArrow;
};
