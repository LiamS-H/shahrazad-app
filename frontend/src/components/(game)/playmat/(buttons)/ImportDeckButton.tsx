"use client";
import { Button } from "@/components/(ui)/button";
import { useImportContext } from "@/contexts/(game)/import";
import { usePlayer } from "@/contexts/(game)/player";
import { Import } from "lucide-react";

export function ImportDeckButton() {
    const { importFor: playerImport } = useImportContext();
    const { player } = usePlayer();

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => {
                playerImport(player);
            }}
        >
            <Import className="h-[1.2rem] w-[1.2rem]" />
        </Button>
    );
}
