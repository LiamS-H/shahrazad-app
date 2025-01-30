"use client";
import { useDevice } from "@/hooks/useDevice";
/* eslint-disable  @typescript-eslint/no-explicit-any */
/* this is for webkit */

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { toast } from "sonner";

interface IFullScreenContext {
    isFullscreen: boolean;
    toggleFullscreen: (fullscreen?: boolean) => void;
}
const FullscreenContext = createContext<IFullScreenContext | null>(null);

function getCurrentFullscreen() {
    let cur_fs;
    if (
        typeof (document as any).webkitCurrentFullScreenElement !== "undefined"
    ) {
        cur_fs = !!(document as any).webkitCurrentFullScreenElement;
    } else {
        cur_fs = !!document.fullscreenElement;
    }
    return cur_fs;
}

export function FullscreenContextProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const device = useDevice();
    const toggleFullscreen = useCallback(
        async (future_fs?: boolean) => {
            const promises = [];
            future_fs =
                future_fs !== undefined ? future_fs : !getCurrentFullscreen();
            if (future_fs) {
                const element = document.documentElement;
                if (device === "notOSX" && element.requestFullscreen) {
                    promises.push(element.requestFullscreen());
                } else if ((element as any).webkitRequestFullscreen) {
                    promises.push((element as any).webkitRequestFullscreen());
                }
            } else {
                if (device === "notOSX" && document.exitFullscreen) {
                    promises.push(document.exitFullscreen());
                } else if ((document as any).webkitExitFullscreen) {
                    promises.push((document as any).webkitExitFullscreen());
                }
            }
            try {
                await Promise.all(promises);
            } catch {
                if (future_fs) {
                    toast("Couldn't enter fullscreen, refresh and try button.");
                } else {
                    toast("Couldn't exit fullscreen, refresh and try button.");
                }
            }
        },
        [device]
    );

    useEffect(() => {
        const controller = new AbortController();

        window.addEventListener(
            "resize",
            () => {
                setIsFullscreen(getCurrentFullscreen());
            },
            { signal: controller.signal }
        );
        window.addEventListener(
            "keydown",
            (e) => {
                if (e.key === "F11") {
                    console.log("preventing fullscreen");
                    e.preventDefault();
                    toggleFullscreen();
                    return;
                }
                if (
                    device === "OSX" &&
                    e.metaKey &&
                    (e.key === "F" || e.key === "f")
                ) {
                    e.preventDefault();
                    toggleFullscreen();
                    return;
                }
            },
            { signal: controller.signal }
        );

        return () => controller.abort();
    }, [device, toggleFullscreen]);

    return (
        <FullscreenContext.Provider value={{ isFullscreen, toggleFullscreen }}>
            {children}
        </FullscreenContext.Provider>
    );
}

export function useFullscreen() {
    const context = useContext(FullscreenContext);
    if (!context) {
        throw Error("useFullscreen must be used inside context.");
    }
    return context;
}
