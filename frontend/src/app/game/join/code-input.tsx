import { useCallback, useEffect, useRef } from "react";

import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/(ui)/input-otp";
export function CodeInput({
    code,
    setCode,
    invalid,
    onSubmit,
}: {
    code: string;
    setCode: (s: string) => void;
    invalid?: boolean;
    onSubmit: () => void;
}) {
    const handleChange = useCallback(
        (e: string) => {
            const num = Number(e);
            if (num || e === "") setCode(e);
        },
        [setCode]
    );

    useEffect(() => {
        ref.current?.focus();
    }, []);

    const ref = useRef<HTMLInputElement | null>(null);

    return (
        <InputOTP
            ref={ref}
            maxLength={6}
            value={code}
            onChange={handleChange}
            onComplete={onSubmit}
        >
            <InputOTPGroup
                className={`text-xl ${
                    invalid ? "text-destructive" : undefined
                }`}
            >
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSeparator />
                <InputOTPSlot className="border-l" index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
            </InputOTPGroup>
        </InputOTP>
    );
}
