import { useRef } from "react";

type Device = "OSX" | "notOSX";

export function useDevice(): Device {
    const user_ref = useRef<null | Device>(null);
    if (user_ref.current) return user_ref.current;

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

    return device;
}
