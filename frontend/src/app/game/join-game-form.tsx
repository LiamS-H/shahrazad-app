"use client";
import { CodeInput } from "./code-input";
import { Button } from "@/components/(ui)/button";
import { Label } from "@/components/(ui)/label";
import { TabsContent } from "@/components/(ui)/tabs";
import { ClipboardPaste, X } from "lucide-react";
import {
    useCallback,
    useEffect,
    useState,
    Dispatch,
    SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { joinGame } from "@/lib/client/joinGame";
import { loadPlayer, savePlayer } from "@/lib/client/localPlayer";

import JoinGameLoading from "./join-game-loading";

export default function JoinGameForm({
    invalids,
    setInvalids,
    reconnect,
    clipboard,
}: {
    invalids: Set<string>;
    setInvalids: Dispatch<SetStateAction<Set<string>>>;
    reconnect: string;
    clipboard: string | null;
}) {
    const { push: pushRoute } = useRouter();

    const [gameCode, setGameCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        if (reconnect) return;
        if (!clipboard) return;
        if (invalids.has(clipboard)) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setGameCode(clipboard);
    }, [clipboard, reconnect, invalids]);

    const handleJoinGame = useCallback(
        async (gameCode: string) => {
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
        },
        [pushRoute, setInvalids],
    );

    // useEffect(() => {
    //     const value = parseCode(gameCode);
    //     if (!value) return;
    //     // eslint-disable-next-line react-hooks/set-state-in-effect
    //     handleJoinGame(value);
    // }, [gameCode, handleJoinGame]);

    useEffect(() => {
        setIsClient(true); // eslint-disable-line react-hooks/set-state-in-effect
    }, []);

    const pasteButtonDisabled =
        clipboard === null || clipboard === gameCode || invalids.has(clipboard);

    if (!isClient) {
        return <JoinGameLoading />;
    }

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
                            type="button"
                        >
                            <X />
                        </Button>
                        <CodeInput
                            code={gameCode}
                            setCode={setGameCode}
                            invalid={invalids.has(gameCode)}
                            // onSubmit={() => handleJoinGame(gameCode)}
                            onSubmit={() => {}}
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
                            type="button"
                        >
                            <ClipboardPaste />
                        </Button>
                    </div>

                    {reconnect &&
                    !invalids.has(reconnect) &&
                    gameCode === "" ? (
                        <Button
                            className="w-full mt-4"
                            variant="highlight"
                            disabled={loading || invalids.has(reconnect)}
                            onClick={() => handleJoinGame(reconnect)}
                            type="button"
                        >
                            {loading
                                ? "loading..."
                                : `Reconnect - ${reconnect}`}
                        </Button>
                    ) : (
                        <Button
                            className="w-full mt-4"
                            disabled={loading || invalids.has(gameCode)}
                            onClick={() => handleJoinGame(gameCode)}
                            type="button"
                        >
                            {loading ? "loading..." : `Join Game`}
                        </Button>
                    )}
                </form>
            </div>
        </TabsContent>
    );
}
