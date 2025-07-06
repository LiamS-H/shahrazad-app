"use client";

import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";

import { useArrowsContext } from "@/contexts/(game)/arrows";
import {
    ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuPortal,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
} from "@/components/(ui)/context-menu";
import { ShahrazadCardId } from "@/types/bindings/card";

const ContextMenu = ContextMenuPrimitive.Root;

const ContextMenuTrigger = React.forwardRef<
    React.ElementRef<typeof ContextMenuPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Trigger> & {
        cardId: ShahrazadCardId;
        zoneId?: ShahrazadCardId;
    }
>(({ zoneId, cardId, ...props }, ref) => {
    const { isActive, active } = useArrowsContext();
    return (
        <ContextMenuPrimitive.Trigger
            disabled={isActive && active !== zoneId && active !== cardId}
            ref={ref}
            {...props}
        />
    );
});
ContextMenuTrigger.displayName = ContextMenuPrimitive.Trigger.displayName;

export {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuCheckboxItem,
    ContextMenuRadioItem,
    ContextMenuLabel,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuGroup,
    ContextMenuPortal,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuRadioGroup,
};
