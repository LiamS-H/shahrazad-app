"use client";

import { Button } from "@/components/(ui)/button";
import { DiceIcon } from "@/components/(ui)/dice";
import { Input } from "@/components/(ui)/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";
import { useState } from "react";
import { BadgeHelpIcon } from "lucide-react";

export function DiceRoller({
    rollDice,
}: {
    rollDice: (sides: number) => void;
}) {
    const [customSides, setCustomSides] = useState("");

    function handleCustomRoll() {
        const sides = parseInt(customSides);
        if (!isNaN(sides) && sides > 0) {
            rollDice(sides);
            setCustomSides("");
        }
    }

    return (
        <div className="flex gap-2 justify-center">
            <Button
                onClick={() => rollDice(2)}
                size="icon"
                className="hover:text-highlight p-1"
                variant="ghost"
            >
                <DiceIcon sides={2} />
            </Button>
            <Button
                onClick={() => rollDice(6)}
                size="icon"
                className="hover:text-highlight p-1"
                variant="ghost"
            >
                <DiceIcon className="h-10 w-10" sides={6} />
            </Button>
            <Button
                onClick={() => rollDice(20)}
                size="icon"
                className="hover:text-highlight p-1"
                variant="ghost"
            >
                <DiceIcon sides={20} />
            </Button>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        className="hover:text-highlight p-1"
                        size="icon"
                    >
                        <BadgeHelpIcon
                            style={{ height: "100%", width: "100%" }}
                        />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-44 flex gap-2">
                    <Input
                        type="number"
                        placeholder="Sides"
                        value={customSides}
                        onChange={(e) => setCustomSides(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleCustomRoll();
                            }
                        }}
                    />
                    <Button
                        onClick={handleCustomRoll}
                        // className="hover:text-highlight"
                        variant="outline"
                    >
                        Roll
                    </Button>
                </PopoverContent>
            </Popover>
        </div>
    );
}
