"use client";
import { type RefObject, useEffect, useRef } from "react";

type Device = "OSX" | "notOSX" | null;

export function useDevice(): RefObject<Device | null> {
    const user_ref = useRef<null | Device>(null);

    useEffect(() => {
        if (user_ref.current) return;
        let device: Device;
        if (
            window.navigator.userAgent.includes("mac") ||
            window.navigator.userAgent.includes("ip")
        ) {
            device = "OSX";
        } else {
            device = "notOSX";
        }
        user_ref.current = device;
    }, []);

    return user_ref;
}
