import { useMemo } from "react";

function formatRelativeTime(iso: string) {
    const now = new Date();
    const date = new Date(iso);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "just now";
    if (diff < 3600)
        return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) > 1 ? "s" : ""}`;
    if (diff < 86400)
        return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? "s" : ""}`;
    if (diff < 2592000)
        return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? "s" : ""}`;
    if (diff < 31536000)
        return `${Math.floor(diff / 2592000)} month${Math.floor(diff / 2592000) > 1 ? "s" : ""}`;
    return `${Math.floor(diff / 31536000)} year${Math.floor(diff / 31536000) > 1 ? "s" : ""}`;
}

export function TimeBadge({
    iso,
    prefix,
    suffix,
}: {
    iso: string;
    prefix?: string;
    suffix?: string;
}) {
    const label = useMemo(() => formatRelativeTime(iso), [iso]);

    return (
        <>
            {prefix}
            {label}
            {suffix}
        </>
    );
}
