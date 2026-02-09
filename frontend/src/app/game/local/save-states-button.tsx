"use client";
import { Button } from "@/components/(ui)/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/(ui)/dropdown-menu";
import { Input } from "@/components/(ui)/input";
import { Copy, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function SaveStatesButton({
    code,
    loadCode,
}: {
    code: string | null;
    loadCode: (code: string) => boolean;
}) {
    const [open, setOpen] = useState(false);
    const [codeInput, setCodeInput] = useState("");

    function handleSubmitCode(code: string) {
        if (code === "") return false;
        if (loadCode(code)) {
            setOpen(false);
        }
    }

    if (!code) {
        return (
            <Button variant="highlight" disabled>
                Saves
                <Save />
            </Button>
        );
    }
    return (
        <DropdownMenu
            open={open}
            onOpenChange={(o) => {
                if (!o) {
                    handleSubmitCode(codeInput);
                }
                setOpen(o);
            }}
        >
            <DropdownMenuTrigger asChild>
                <Button
                    variant="highlight"
                    className={
                        open ? " bg-primary text-primary-foreground" : ""
                    }
                >
                    Saves
                    <Save />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col gap-2 w-full ">
                <Button
                    variant="outline"
                    onClick={() => {
                        const link = window.location.toString();
                        if (!link) {
                            toast("Something went wrong");
                            return;
                        }
                        navigator.clipboard.writeText(link);
                        toast(`Copied sharing link to clipboard.`);
                        setOpen(false);
                    }}
                >
                    Sharing Link
                    <Copy />
                </Button>
                <Button
                    className="group"
                    disabled={!code}
                    variant="outline"
                    onClick={() => {
                        if (!code) return;
                        navigator.clipboard.writeText(code.toString());
                        toast(`Copied "${code}" to clipboard.`);
                        setOpen(false);
                    }}
                >
                    State Code
                    <Copy />
                </Button>

                <Input
                    onFocus={(e) => {
                        e.target.select();
                    }}
                    placeholder="Enter Code"
                    className="w-36"
                    value={codeInput}
                    onChange={(e) => {
                        const new_code = e.target.value;
                        handleSubmitCode(new_code);
                        setCodeInput(new_code);
                    }}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
