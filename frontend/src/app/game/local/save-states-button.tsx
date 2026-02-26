"use client";
import { Button } from "@/components/(ui)/button";

import { Input } from "@/components/(ui)/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";
import { copy_with_toast } from "@/lib/utils/copy-with-toast";
import { Copy, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function SaveStatesButton({
    getCode,
    loadCode,
}: {
    getCode: null | (() => string);
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

    if (!getCode) {
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
                    disabled={!getCode}
                    onClick={() => {
                        const code = getCode();
                        if (!code) return;
                        const link = new URL(window.location.toString());
                        link.searchParams.delete("settings");
                        link.searchParams.set("code", code);
                        if (!link) {
                            toast.error("Couldn't generate link.");
                            return;
                        }
                        copy_with_toast({
                            value: link.toString(),
                            name: "Sharing Link",
                        });
                    }}
                >
                    Sharing Link
                    <Copy />
                </Button>
                <Button
                    className="group"
                    disabled={!getCode}
                    variant="outline"
                    onClick={() => {
                        const code = getCode();
                        if (!code) return;

                        copy_with_toast({
                            value: code.toString(),
                            loading_name: "Save Code",
                            name: `"${code.substring(0, 10)}..."`,
                            error_name: "Save Code",
                        });
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
