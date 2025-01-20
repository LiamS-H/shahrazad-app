import { useCallback } from "react";

import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/(ui)/input-otp";
import { parseCode } from "@/lib/client/parseCode";
export function CodeInput(props: {
    code: string;
    setCode: (s: string) => void;
    invalid?: boolean;
}) {
    const handleChange = useCallback(
        (e: string) => {
            const num = Number(e);
            if (num || e === "") props.setCode(e);
        },
        [props.setCode]
    );

    return (
        <InputOTP maxLength={6} value={props.code} onChange={handleChange}>
            <InputOTPGroup
                className={props.invalid ? "text-destructive" : undefined}
            >
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSeparator />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
            </InputOTPGroup>
        </InputOTP>
    );
}
