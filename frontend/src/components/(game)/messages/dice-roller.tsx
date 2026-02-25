"use client";

import { Button } from "@/components/(ui)/button";
import { DiceIcon } from "@/components/(ui)/dice";
import { BadgeHelpIcon } from "lucide-react";
import { EditableText } from "@/components/(ui)/editable-text";

export function DiceRoller({
    rollDice,
}: {
    rollDice: (sides: number) => void;
}) {
    return (
        <div className="flex gap-2 justify-center">
            <Button onClick={() => rollDice(2)} size="icon" variant="outline">
                <DiceIcon sides={2} />
            </Button>
            <Button onClick={() => rollDice(6)} size="icon" variant="outline">
                <DiceIcon className="h-10 w-10" sides={6} />
            </Button>
            <Button onClick={() => rollDice(20)} size="icon" variant="outline">
                <DiceIcon sides={20} />
            </Button>
            <EditableText
                type="number"
                placeholder="Custom sides"
                value=""
                onSave={(val) => {
                    const sides = parseInt(val);
                    if (!isNaN(sides) && sides > 0) {
                        rollDice(sides);
                    }
                }}
                contentClassName="w-44"
                afterInput={
                    <Button
                        variant="outline"
                        onClick={() => {
                            // This will be handled by onSave when the popover closes or enter is pressed
                        }}
                    >
                        Roll
                    </Button>
                }
            >
                <Button variant="outline" size="icon">
                    <BadgeHelpIcon />
                </Button>
            </EditableText>
        </div>
    );
}
