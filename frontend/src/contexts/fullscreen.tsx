"use client";
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

interface IFullScreenContext {
    isFullscreen: boolean;
    enterFullscreen: () => void;
    exitFullscreen: () => void;
}
const FullscreenContext = createContext<IFullScreenContext | null>(null);

export function FullscreenContextProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        window.addEventListener(
            "resize",
            () => {
                setIsFullscreen(window.innerHeight === screen.height);
            },
            { signal: controller.signal }
        );

        return () => controller.abort();
    }, []);

    const exitFullscreen = useCallback(async () => {
        const promises = [];
        if (document.exitFullscreen) {
            promises.push(document.exitFullscreen());
        } else if ((document as any).webkitExitFullscreen) {
            promises.push((document as any).webkitExitFullscreen());
        }
        try {
            await Promise.all(promises);
            setIsFullscreen(true);
        } catch {
            console.error("couldn't exit fullscreen.");
        }
    }, []);

    const enterFullscreen = useCallback(async () => {
        const element = document.documentElement;
        const promises = [];
        if (element.requestFullscreen) {
            promises.push(element.requestFullscreen());
        } else if ((element as any).webkitRequestFullscreen) {
            promises.push((element as any).webkitRequestFullscreen());
        }
        try {
            await Promise.all(promises);
            setIsFullscreen(true);
        } catch {
            console.error("couldn't enter fullscreen.");
        }
    }, []);

    return (
        <FullscreenContext.Provider
            value={{ isFullscreen, enterFullscreen, exitFullscreen }}
        >
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
