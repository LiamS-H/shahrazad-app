"use client";
import { Button } from "@/components/(ui)/button";
import { useImportContext } from "@/contexts/(game)/import";
import { usePlayer } from "@/contexts/(game)/player";
import { Import } from "lucide-react";
import { ComponentProps } from "react";

export function ImportDeckButton({
    variant = "outline",
    ...props
}: ComponentProps<typeof Button>) {
    const { importFor: playerImport } = useImportContext();
    const { player } = usePlayer();

    return (
        <Button
            variant={variant}
            size="icon"
            onClick={() => {
                playerImport(player);
            }}
            {...props}
        >
            <Import className="h-[1.2rem] w-[1.2rem]" />
        </Button>
    );
}
