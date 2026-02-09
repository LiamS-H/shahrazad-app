"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import CreateGameForm from "./create-game-form";
import JoinGameForm from "./join-game-form";

import { parseCode } from "@/lib/client/parseCode";
import { fetchGame } from "@/lib/client/fecthGame";
import { useRouter } from "next/navigation";

export default function GameConfigPage() {
    const router = useRouter();
    const [invalids, setInvalids] = useState<Set<string>>(new Set());
    const [reconnect, setReconnect] = useState("");
    const [clipboard, setClipboard] = useState<string | null>(null);
    const initRef = useRef(false);

    const checkGame = useCallback(
        async (code: string | null | undefined) => {
            const parsed = parseCode(code || undefined);
            if (!parsed || invalids.has(parsed)) return null;

            const game = await fetchGame(parsed);
            if (game === null) {
                setInvalids((prev) => new Set(prev).add(parsed));
                return null;
            }
            if (game === undefined) return null;
            return parsed;
        },
        [invalids],
    );

    const readClipboard = useCallback(
        async (shouldValidate = false) => {
            try {
                const text = await navigator.clipboard.readText();
                const parsed = parseCode(text);
                setClipboard(parsed);

                if (shouldValidate && parsed) {
                    const valid = await checkGame(parsed);
                    if (valid) {
                        router.replace("/game?tab=join");
                        return true;
                    }
                }
                return false;
            } catch {
                //document wasn't focused
            }
        },
        [checkGame, router],
    );

    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;

        const checkAutoJoin = async () => {
            const savedCode = localStorage.getItem("saved-game");
            const validSavedCode = await checkGame(savedCode);

            if (validSavedCode) {
                setReconnect(validSavedCode);
                router.replace("/game?tab=join");
                return;
            } else if (savedCode) {
                localStorage.setItem("saved-game", "");
            }

            await readClipboard(true);
        };

        checkAutoJoin();
    }, [checkGame, readClipboard, router]);

    useEffect(() => {
        const controller = new AbortController();
        const handleFocus = () => readClipboard();

        window.addEventListener("focus", handleFocus, {
            signal: controller.signal,
        });
        window.addEventListener("paste", handleFocus, {
            signal: controller.signal,
        });

        return () => controller.abort();
    }, [readClipboard]);

    return (
        <>
            <CreateGameForm />
            <JoinGameForm
                invalids={invalids}
                setInvalids={setInvalids}
                reconnect={reconnect}
                clipboard={clipboard}
            />
        </>
    );
}
