"use client";
import { Button } from "@/components/(ui)/button";

import { Input } from "@/components/(ui)/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";
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
            setCodeInput("");
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
        <Popover
            open={open}
            onOpenChange={(o) => {
                if (!o) {
                    handleSubmitCode(codeInput);
                }
                setOpen(o);
            }}
        >
            <PopoverTrigger asChild>
                <Button
                    variant="highlight"
                    className={
                        open ? " bg-primary text-primary-foreground" : ""
                    }
                >
                    Saves
                    <Save />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-2 w-full ">
                <Button
                    variant="outline"
                    onClick={() => {
                        const link = new URL(window.location.toString());
                        link.searchParams.delete("settings");
                        link.searchParams.set("code", code);
                        if (!link) {
                            toast("Something went wrong");
                            return;
                        }
                        navigator.clipboard.writeText(link.toString());
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
                        toast(
                            `Copied "${code.substring(0, 10)}..." to clipboard.`,
                        );
                        setOpen(false);
                    }}
                >
                    State Code
                    <Copy />
                </Button>

                <Input
                    autoFocus
                    onFocus={(e) => {
                        e.target.select();
                    }}
                    placeholder="Enter Code"
                    className="w-36"
                    value={codeInput}
                    onChange={(e) => {
                        const new_code = e.target.value;
                        setCodeInput(new_code);
                        handleSubmitCode(new_code);
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
