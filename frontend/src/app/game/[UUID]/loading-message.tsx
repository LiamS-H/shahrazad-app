"use client";
import { useWasmIntialized } from "@/hooks/useWasmInitialized";
import { useEffect, useState } from "react";

function PulsingDots() {
    return (
        <span className="inline-flex w-8 justify-start">
            <span className="animate-[pulse_1.5s_ease-in-out_infinite]">.</span>
            <span className="animate-[pulse_1.5s_ease-in-out_0.2s_infinite]">
                .
            </span>
            <span className="animate-[pulse_1.5s_ease-in-out_0.4s_infinite]">
                .
            </span>
        </span>
    );
}

function StatusMessage({
    text,
    variant = "loading",
}: {
    text: string;
    variant?: "loading" | "success";
}) {
    const baseClass = "flex items-center";
    const variantClasses = {
        loading: "text-muted-foreground/70",
        success: "text-highlight",
    };

    return (
        <span className={`${baseClass} ${variantClasses[variant]}`}>
            {text}
            {variant === "loading" && <PulsingDots />}
        </span>
    );
}

export function LoadingMessage({
    server_loading,
}: {
    server_loading?: boolean;
}) {
    const wasmReady = useWasmIntialized();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="flex flex-col items-start gap-1 h-64">
                <StatusMessage text="loading page data" variant="loading" />
            </div>
        );
    }

    const getServerStatus = () => {
        if (server_loading === undefined) return null;

        if (server_loading) {
            return (
                <StatusMessage text="Fetching game data" variant="loading" />
            );
        }
        return <StatusMessage text="Game data received" variant="success" />;
    };

    const getSyncStatus = () => {
        if (server_loading !== false) return null;

        if (wasmReady) {
            return (
                <span className="text-highlight animate-pulse italic">
                    Syncing state
                    <PulsingDots />
                </span>
            );
        }
        return <StatusMessage text="Waiting for Wasm" variant="loading" />;
    };

    return (
        <div className="flex flex-col items-start gap-1 h-64 w-40">
            <StatusMessage text="Page loaded" variant="success" />

            {wasmReady ? (
                <StatusMessage text="Wasm initialized" variant="success" />
            ) : (
                <StatusMessage text="Binding Wasm" variant="loading" />
            )}
            {getServerStatus()}
            {getSyncStatus()}
        </div>
    );
}
