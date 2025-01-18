import { Button } from "@/components/(ui)/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/(ui)/dropdown-menu";
import { Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ShareGameButton({ code }: { code: number }) {
    const [open, setOpen] = useState(false);
    const link = window.location.toString();

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="absolute top-4 right-4">
                    Share
                    <Share2 />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col gap-4 w-full ">
                <Button
                    variant="outline"
                    onClick={() => {
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
