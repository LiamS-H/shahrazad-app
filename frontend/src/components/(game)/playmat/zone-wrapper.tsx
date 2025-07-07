import { forwardRef, HTMLAttributes } from "react";
import { ShahrazadZoneId } from "@/types/bindings/zone";

interface ZoneWrapperProps extends HTMLAttributes<HTMLDivElement> {
    zoneId: ShahrazadZoneId;
}

const ZoneWrapper = forwardRef<HTMLDivElement, ZoneWrapperProps>(
    ({ zoneId, ...props }, ref) => {
        return <div ref={ref} data-shahzone={zoneId} {...props} />;
    }
);

ZoneWrapper.displayName = "ZoneWrapper";

export default ZoneWrapper;
