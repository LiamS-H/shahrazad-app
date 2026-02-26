"use client";
import { Button } from "@/components/(ui)/button";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/(ui)/popover";
import { copy_with_toast } from "@/lib/utils/copy-with-toast";
import { Copy, DiamondPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ShareGameButton({ code }: { code: number | null }) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="highlight"
                    className={`group${
                        open ? " bg-primary text-primary-foreground" : ""
                    }`}
                >
                    Invite
                    <DiamondPlus className="transition duration-300 group-hover:rotate-[360deg]" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-1.5 w-full">
                <Button
                    disabled={!code}
                    variant="outline"
                    onClick={() => {
                        if (!code) return;
                        copy_with_toast({
                            value: code.toString(),
                            name: `"${code}"`,
                        });
                        setOpen(false);
                    }}
                >
                    {code}
                    <Copy />
                </Button>
                <Button
                    variant="outline"
                    onClick={() => {
                        const link = window.location.toString();
                        if (!link) {
                            toast.error("Couldn't generate link.");
                            return;
                        }
                        copy_with_toast({ value: link, name: "Sharing Link" });
                        setOpen(false);
                    }}
                >
                    Link
                    <Copy />
                </Button>
            </PopoverContent>
        </Popover>
    );
}
