"use client";

import { cx } from "class-variance-authority";

export function OutlineButton({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <button
            className={cx(
                `group relative overflow-hidden border border-muted-foreground text-muted-foreground px-8 py-3.5 text-sm tracking-wide transition-all hover:border-highlight/40 hover:text-highlight active:scale-[0.98] `,
                className,
            )}
        >
            <span className="relative z-10">{children}</span>
        </button>
    );
}
