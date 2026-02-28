"use client";
export function SweepButton({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <button
            className={`group relative overflow-hidden bg-highlight text-highlight-foreground px-10 py-3.5 font-bold text-sm tracking-wide transition-all hover:scale-105 active:scale-[0.98] ${className}`}
        >
            <span className="relative z-10">{children}</span>
            <div className="absolute inset-0 flex h-full w-full [transform:skew(-12deg)_translateX(-100%)] justify-center group-hover:[transform:skew(-12deg)_translateX(100%)] group-hover:duration-1000">
                <div className="relative h-full w-8 bg-white/20" />
            </div>
        </button>
    );
}
