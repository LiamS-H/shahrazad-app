"use client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/(ui)/dialog";
import { useMessagesContext } from "@/contexts/(game)/messages";
import { DiceRoller } from "./dice-roller";
import { Message } from "./message";
import { Button } from "@/components/(ui)/button";
import { Dices } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCase } from "@/types/bindings/message";
import { useShahrazadGameContext } from "@/contexts/(game)/game";

export function MessagesDialog() {
    const { isOpen, setIsOpen, messages } = useMessagesContext();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [lastRoll, setLastRoll] = useState<number | null>(null);

    const { sendMessage } = useMessagesContext();
    const { active_player } = useShahrazadGameContext();

    const scrollBottom = useCallback(
        (behavior: ScrollBehavior = "smooth") => {
            messagesEndRef.current?.scrollIntoView({ behavior });
        },
        [messagesEndRef]
    );

    useEffect(() => {
        if (isOpen && chatContainerRef.current) {
            setTimeout(() => {
                scrollBottom("smooth");
            }, 0);
        }
    }, [isOpen, scrollBottom]);

    useEffect(() => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } =
                chatContainerRef.current;
            const isAtBottom = scrollHeight - scrollTop <= clientHeight + 40;
            if (isAtBottom) {
                scrollBottom();
            }
        }
    }, [messages, scrollBottom]);

    const rollDice = useCallback(
        (sides: number) => {
            const result = Math.floor(Math.random() * sides) + 1;
            sendMessage({
                messages: [
                    {
                        type: MessageCase.DiceRoll,
                        sides,
                        result,
                    },
                ],
                player_id: active_player,
            });
            setLastRoll(sides);
        },
        [active_player, sendMessage]
    );

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(o) => {
                setIsOpen(o);
            }}
        >
            <DialogContent className="flex flex-col gap-4">
                <DialogHeader>
                    <DialogTitle>Roll Dice</DialogTitle>
                    <DialogDescription>
                        Roll dice and see game messages.
                    </DialogDescription>
                </DialogHeader>
                <div
                    ref={chatContainerRef}
                    className="h-96 w-full rounded-md border p-4 overflow-y-auto flex flex-col-reverse"
                >
                    <div className="flex flex-col-reverse items-end gap-2">
                        {messages.toReversed().map((msg, i) => (
                            <Message
                                lastRoll={lastRoll}
                                key={i}
                                message={msg}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <DiceRoller rollDice={rollDice} />
            </DialogContent>
        </Dialog>
    );
}

export function MessagesButton() {
    const { setIsOpen } = useMessagesContext();
    return (
        <Button variant="outline" size="icon" onClick={() => setIsOpen(true)}>
            <Dices />
        </Button>
    );
}
