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

export function FullscreenContextProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const device = useDevice();

    const toggleFullscreen = useCallback(async (fs?: boolean) => {
        const promises = [];
        fs = fs !== undefined ? fs : window.innerHeight !== screen.height;
        if (fs) {
            const element = document.documentElement;
            if (element.requestFullscreen) {
                promises.push(element.requestFullscreen());
            } else if ((element as any).webkitRequestFullscreen) {
                promises.push((element as any).webkitRequestFullscreen());
            }
        } else {
            if (document.exitFullscreen) {
                promises.push(document.exitFullscreen());
            } else if ((document as any).webkitExitFullscreen) {
                promises.push((document as any).webkitExitFullscreen());
            }
        }
        try {
            await Promise.all(promises);
        } catch {
            if (fs) {
                toast("Couldn't enter fullscreen, refresh and try button.");
            } else {
                toast("Couldn't exit fullscreen, refresh and try button.");
            }
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        window.addEventListener(
            "resize",
            () => {
                setIsFullscreen(window.innerHeight === screen.height);
            },
            { signal: controller.signal }
        );
        window.addEventListener(
            "keydown",
            (e) => {
                if (e.key === "F11") {
                    e.preventDefault();
                    toggleFullscreen();
                    return;
                }
                if (
                    device.current === "OSX" &&
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
