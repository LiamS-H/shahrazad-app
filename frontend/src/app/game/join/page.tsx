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
    const invalids_ref = useRef(new Set<string>());
    const [reconnect, setReconnect] = useState("");

    const init_ref = useRef(false);

    useEffect(() => {
        if (init_ref.current) return;
        init_ref.current = true;
        const code = parseCode(localStorage.getItem("saved-game") || undefined);
        if (!code) {
            readClipboard();
            return;
        }
        if (invalids_ref.current.has(code)) return;
        fetchGame(code).then((r) => {
            if (r === undefined) return;
            if (r === null) {
                invalids_ref.current.add(code);
                localStorage.setItem("saved-game", "");
                return;
            }
            setReconnect(code);
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const readClipboard = useCallback(() => {
        navigator.clipboard
            .readText()
            .then((c) => {
                const value = parseCode(c);
                setClipboard(value);
                if (!value) return;
                if (invalids_ref.current.has(value)) return;
                setGameCode(value);
            })
            .catch(() => {});
    }, []);

    const pasteButtonDisabled =
        clipboard === null ||
        clipboard === gameCode ||
        invalids_ref.current.has(clipboard);

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
        setLoading(true);
        toast("Joining Game...");
        const stored_player = loadPlayer();
        const joinResult = await joinGame(gameCode, stored_player);
        if (joinResult === null) {
            setLoading(false);
            toast("Couldn't find game");
            invalids_ref.current.add(gameCode);
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
    const joinDisabled =
        gameCode.length !== 6 || loading || invalids_ref.current.has(gameCode);

    return (
        <TabsContent value="join">
            <div className="space-y-4 pt-4">
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
                        invalid={invalids_ref.current.has(gameCode)}
                    />
                    <Button
                        size="icon"
                        variant={pasteButtonDisabled ? "outline" : "default"}
                        disabled={pasteButtonDisabled}
                        onClick={() => {
                            if (clipboard) setGameCode(clipboard);
                        }}
                    >
                        <ClipboardPaste />
                    </Button>
                </div>

                <Button
                    className="w-full"
                    variant={joinDisabled ? "outline" : "default"}
                    disabled={joinDisabled}
                    onClick={() => handleJoinGame(gameCode)}
                >
                    {loading ? "loading..." : "Join Game"}
                </Button>
                {reconnect && !invalids_ref.current.has(reconnect) && (
                    <Button
                        className="w-full"
                        variant="highlight"
                        disabled={
                            loading || invalids_ref.current.has(reconnect)
                        }
                        onClick={() => handleJoinGame(reconnect)}
                    >
                        {loading ? "loading..." : `Reconnect - ${reconnect}`}
                    </Button>
                )}
            </div>
        </TabsContent>
    );
}
