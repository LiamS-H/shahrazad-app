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

export default function JoinGameForm() {
    const { push: pushRoute } = useRouter();

    const [gameCode, setGameCode] = useState("");
    const [clipboard, setClipboard] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        readClipboard(); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const invalids_ref = useRef(new Set<string>());
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
    const handleJoinGame = async () => {
        setLoading(true);
        toast("Joining Game...");
        const stored_player = localStorage.getItem("saved-player") || undefined;
        const joinResult = await joinGame(gameCode, stored_player);
        setLoading(false);
        if (joinResult === null) {
            toast("Couldn't find game");
            invalids_ref.current.add(gameCode);
            return;
        }
        if (joinResult === undefined) {
            toast("Something went wrong.");
            return;
        }
        const { player_id, code } = joinResult;
        localStorage.setItem("saved-player", player_id);

        pushRoute(`/game/${code}`);
    };
    return (
        <TabsContent value="join">
            <form
                className="space-y-4 pt-4"
                onSubmit={(e) => {
                    console.log("submitting");
                    e.preventDefault();
                    handleJoinGame();
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
                    type="submit"
                    className="w-full"
                    disabled={
                        gameCode.length !== 6 ||
                        loading ||
                        invalids_ref.current.has(gameCode)
                    }
                >
                    {loading ? "loading..." : "Join Game"}
                </Button>
            </form>
        </TabsContent>
    );
}
