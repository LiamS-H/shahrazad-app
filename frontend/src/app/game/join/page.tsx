"use client";
import { CodeInput } from "@/app/game/join/code-input";
import { Button } from "@/components/(ui)/button";
import { Label } from "@/components/(ui)/label";
import { TabsContent } from "@/components/(ui)/tabs";
import { ClipboardPaste, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { parseCode } from "@/lib/client/parseCode";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { joinGame } from "@/lib/client/joinGame";
import { fetchGame } from "@/lib/client/fecthGame";
import { loadPlayer, savePlayer } from "@/lib/client/localPlayer";

export default function JoinGameForm() {
    const { push: pushRoute } = useRouter();

    const [gameCode, setGameCode] = useState("");
    const [clipboard, setClipboard] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [invalids, setInvalids] = useState<Set<string>>(new Set());
    const [reconnect, setReconnect] = useState("");

    const init_ref = useRef(false);

    const readClipboard = useCallback(() => {
        navigator.clipboard
            .readText()
            .then((c) => {
                const value = parseCode(c);
                setClipboard(value);
                if (!value) return;
                if (invalids.has(value)) return;
                setGameCode(value);
            })
            .catch(() => {});
    }, [invalids]);

    useEffect(() => {
        if (init_ref.current) return;
        init_ref.current = true;
        const code = parseCode(localStorage.getItem("saved-game") || undefined);
        if (!code) {
            readClipboard();
            return;
        }
        if (invalids.has(code)) return;
        fetchGame(code).then((r) => {
            if (r === undefined) return;
            if (r === null) {
                setInvalids((prev) => new Set(prev).add(code));
                localStorage.setItem("saved-game", "");
                return;
            }
            setReconnect(code);
        });
    }, [invalids, readClipboard]);

    const pasteButtonDisabled =
        clipboard === null ||
        clipboard === gameCode ||
        invalids.has(clipboard);

    useEffect(() => {
        const controller = new AbortController();

        window.addEventListener("focus", readClipboard, {
            signal: controller.signal,
        });
        window.addEventListener("paste", readClipboard, {
            signal: controller.signal,
        });

        return () => controller.abort();
    }, [gameCode, readClipboard]);
    const handleJoinGame = async (gameCode: string) => {
        if (gameCode.length < 6) {
            toast("Code too short.");
        }

        setLoading(true);

        toast("Joining Game...");
        const stored_player = loadPlayer();
        const joinResult = await joinGame(gameCode, stored_player);
        if (joinResult === null) {
            setLoading(false);
            toast("Couldn't find game");
            setInvalids((prev) => new Set(prev).add(gameCode));
            return;
        }
        if (joinResult === undefined) {
            setLoading(false);
            toast("Something went wrong.");
            return;
        }
        const { player_id, code } = joinResult;
        savePlayer(player_id);

        pushRoute(`/game/${code}`);
    };

    return (
        <TabsContent value="join">
            <div className="space-y-4 pt-4">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleJoinGame(gameCode);
                    }}
                >
                    <Label>Game Code</Label>
                    <div className="flex justify-between items-center">
                        <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => setGameCode("")}
                            disabled={gameCode === ""}
                        >
                            <X />
                        </Button>
                        <CodeInput
                            code={gameCode}
                            setCode={setGameCode}
                            invalid={invalids.has(gameCode)}
                            onSubmit={() => handleJoinGame(gameCode)}
                        />
                        <Button
                            size="icon"
                            variant={
                                pasteButtonDisabled ? "outline" : "default"
                            }
                            disabled={pasteButtonDisabled}
                            onClick={() => {
                                if (clipboard) setGameCode(clipboard);
                            }}
                        >
                            <ClipboardPaste />
                        </Button>
                    </div>

                    {reconnect && !invalids.has(reconnect) && (
                        <Button
                            className="w-full"
                            variant="highlight"
                            disabled={
                                loading || invalids.has(reconnect)
                            }
                            onClick={() => handleJoinGame(reconnect)}
                        >
                            {loading
                                ? "loading..."
                                : `Reconnect - ${reconnect}`}
                        </Button>
                    )}
                </form>
            </div>
        </TabsContent>
    );
}
