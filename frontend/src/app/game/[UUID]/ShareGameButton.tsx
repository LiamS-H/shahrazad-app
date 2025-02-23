"use client";
import { Button } from "@/components/(ui)/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/(ui)/dropdown-menu";
import { Copy, DiamondPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ShareGameButton({ code }: { code: number | null }) {
    const [open, setOpen] = useState(false);
    const [link, setLink] = useState<string | null>(null);
    useEffect(() => {
        setLink(window.location.toString());
    }, []);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="highlight"
                    className={`group${
                        open ? " bg-primary text-primary-foreground" : ""
                    }`}
                >
                    Invite
                    <DiamondPlus className="transition duration-300 group-hover:rotate-[360deg]" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col gap-4 w-full ">
                <Button
                    disabled={!code}
                    variant="outline"
                    onClick={() => {
                        if (!code) return;
                        navigator.clipboard.writeText(code.toString());
                        toast(`Copied "${code}" to clipboard.`);
                        setOpen(false);
                    }}
                >
                    {code}
                    <Copy />
                </Button>
                <Button
                    variant="outline"
                    disabled={!link}
                    onClick={() => {
                        if (!link) {
                            toast("Something went wrong");
                            return;
                        }
                        navigator.clipboard.writeText(link);
                        toast(`Copied sharing link to clipboard.`);
                        setOpen(false);
                    }}
                >
                    Link
                    <Copy />
                </Button>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
