"use client";

import * as React from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";
import { Input } from "@/components/(ui)/input";
import { cn } from "@/lib/utils/tw-merge";

export interface EditableTextProps extends React.ComponentPropsWithoutRef<
    typeof PopoverTrigger
> {
    value: string;
    onSave: (value: string) => void;
}

const EditableText = React.forwardRef<
    React.ComponentRef<typeof PopoverTrigger>,
    EditableTextProps
>(({ value, onSave, children, className, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(value);

    React.useEffect(() => {
        if (open) {
            setInputValue(value);
        }
    }, [value, open]);

    const handleSave = () => {
        onSave(inputValue);
        setOpen(false);
    };

    return (
        <Popover
            open={open}
            onOpenChange={(o) => {
                if (!o && open) {
                    handleSave();
                }
                setOpen(o);
            }}
        >
            <PopoverTrigger ref={ref} className={cn(className)} {...props}>
                {children}
            </PopoverTrigger>
            <PopoverContent
                className="w-fit p-2 flex items-center"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
            >
                <form
                    className="flex-1"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSave();
                    }}
                >
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-24"
                    />
                </form>
            </PopoverContent>
        </Popover>
    );
});
EditableText.displayName = "EditableText";

export { EditableText };
