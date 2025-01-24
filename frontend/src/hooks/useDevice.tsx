"use client";
import { type RefObject, useEffect, useState } from "react";

type Device = "OSX" | "notOSX" | null;

export function useDevice(): Device | null {
    const [device, setDevice] = useState<null | Device>(null);

    useEffect(() => {
        if (device) return;
        if (
            window.navigator.userAgent.includes("mac") ||
            window.navigator.userAgent.includes("ip")
        ) {
            setDevice("OSX");
        } else {
            setDevice("notOSX");
        }
    }, []);

    return device;
}
