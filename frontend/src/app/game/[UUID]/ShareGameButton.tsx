import { Button } from "@/components/(ui)/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/(ui)/dropdown-menu";
import { CirclePlus, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ShareGameButton({ code }: { code: number | null }) {
    const [open, setOpen] = useState(false);
    const link = window.location.toString();

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary">
                    Invite
                    <CirclePlus />
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
                    onClick={() => {
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
