"use client";

import * as React from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/(ui)/popover";
import { Input } from "@/components/(ui)/input";
import { cn } from "@/lib/utils/tw-merge";

export interface EditableTextProps extends Omit<
    React.ComponentPropsWithoutRef<typeof PopoverTrigger>,
    "type"
> {
    value: string;
    onSave: (value: string) => void;
    type?: React.HTMLInputTypeAttribute;
    placeholder?: string;
    inputClassName?: string;
    contentClassName?: string;
    formClassName?: string;
    beforeInput?: React.ReactNode;
    afterInput?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const EditableText = React.forwardRef<
    React.ComponentRef<typeof PopoverTrigger>,
    EditableTextProps
>(
    (
        {
            value,
            onSave,
            children,
            className,
            inputClassName,
            contentClassName,
            formClassName,
            type = "text",
            placeholder,
            beforeInput,
            afterInput,
            open: controlledOpen,
            onOpenChange: controlledOnOpenChange,
            ...props
        },
        ref,
    ) => {
        const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
        const open =
            controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
        const setOpen =
            controlledOnOpenChange !== undefined
                ? controlledOnOpenChange
                : setUncontrolledOpen;

        const [inputValue, setInputValue] = React.useState(value);

        React.useEffect(() => {
            if (open) {
                setInputValue(value);
            }
        }, [value, open]);

        const handleSave = React.useCallback(() => {
            onSave(inputValue);
            setOpen(false);
        }, [inputValue, onSave, setOpen]);

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
                    className={cn(
                        "w-fit p-2 flex items-center gap-1",
                        contentClassName,
                    )}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    {beforeInput}
                    <form
                        className={cn("flex-1", formClassName)}
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSave();
                        }}
                    >
                        <Input
                            type={type}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className={cn("w-24", inputClassName)}
                            placeholder={placeholder}
                            autoFocus
                        />
                    </form>
                    {afterInput}
                </PopoverContent>
            </Popover>
        );
    },
);
EditableText.displayName = "EditableText";

export { EditableText };
