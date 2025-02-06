"use client";
import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

type Device = "OSX" | "notOSX" | null;

const DeviceContext = createContext<Device>(null);

export function useDevice(): Device {
    return useContext(DeviceContext);
}

export function DeviceContextProvider({ children }: { children: ReactNode }) {
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
    }, [device]);

    return (
        <DeviceContext.Provider value={device}>
            {children}
        </DeviceContext.Provider>
    );
}
