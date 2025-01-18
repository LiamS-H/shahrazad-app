"use client";

import { useState, useEffect } from "react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/(ui)/tabs";
import { Card, CardContent } from "@/components/(ui)/card";
import { Label } from "@/components/(ui)/label";
import { Input } from "@/components/(ui)/input";
import { Button } from "@/components/(ui)/button";
import { Switch } from "@/components/(ui)/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/(ui)/select";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/(ui)/input-otp";
import { Slider } from "@/components/(ui)/slider";
import { createGame } from "@/lib/client/createGame";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClipboardPaste, X } from "lucide-react";
import { joinGame } from "@/lib/client/joinGame";

export default function GameForm() {
    const { push: pushRoute } = useRouter();

    const [isClient, setIsClient] = useState(false);
    const [startingLife, setStartingLife] = useState("20");
    const [freeMulligans, setFreeMulligans] = useState(1);
    const [scryRule, setScryRule] = useState(false);
    const [gameCode, setGameCode] = useState("");
    const [clipboard, setClipboard] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsClient(true);

        const safeGetItem = (
            key: string,
            defaultValue: string | number | boolean
        ) => {
            try {
                const item = localStorage.getItem(key);
                return item !== null ? JSON.parse(item) : defaultValue;
            } catch {
                return defaultValue;
            }
        };

        function readClipboard() {
            setTimeout(() => {
                navigator.clipboard
                    .readText()
                    .then((clipboard) => {
                        setClipboard(null);
                        if (clipboard.length !== 6) return;
                        const code = Number(clipboard);
                        if (Number.isNaN(code)) return;
                        if (code >= 100000 && code <= 999999) {
                            setClipboard(clipboard);
                        }
                    })
                    .catch(() => {});
                readClipboard();
            }, 500);
        }
        readClipboard();

        setStartingLife(safeGetItem("default-game-startingLife", "20"));
        setFreeMulligans(safeGetItem("default-game-freeMulligans", 1));
        setScryRule(safeGetItem("default-game-scryRule", false));
    }, []);

    useEffect(() => {
        if (isClient) {
            try {
                localStorage.setItem(
                    "default-game-startingLife",
                    JSON.stringify(startingLife)
                );
                localStorage.setItem(
                    "default-game-freeMulligans",
                    JSON.stringify(freeMulligans)
                );
                localStorage.setItem(
                    "default-game-scryRule",
                    JSON.stringify(scryRule)
                );
            } catch (error) {
                console.error("Failed to update localStorage", error);
            }
        }
    }, [startingLife, freeMulligans, scryRule, isClient]);

    const handleCreateGame = async () => {
        let starting_life = Number(startingLife);
        if (Number.isNaN(starting_life) || starting_life < 0) {
            starting_life = 20;
        }
        setLoading(true);
        const gameResult = await createGame({
            settings: {
                starting_life,
                free_mulligans:
                    freeMulligans === 5 ? "∞" : freeMulligans.toString(),
                scry_rule: scryRule,
            },
        });
        setLoading(false);
        if (gameResult === null) {
            toast("Something went wrong.");
            return;
        }
        const { player_id, code } = gameResult;
        localStorage.setItem("saved-player", player_id);
        pushRoute(`game/${code}`);
    };

    const handleJoinGame = async () => {
        console.log("joining game", gameCode);
        const stored_player = localStorage.getItem("saved-player") || undefined;
        const joinResult = await joinGame(gameCode, stored_player);
        if (joinResult === null) {
            toast("Couldn't find game");
            return;
        }
        if (joinResult === undefined) {
            toast("Something went wrong.");
            return;
        }
        const { player_id, code } = joinResult;
        localStorage.setItem("saved-player", player_id);

        pushRoute(`game/${code}`);
    };

    if (!isClient) {
        return null;
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <Tabs defaultValue="create" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="create">Create Game</TabsTrigger>
                        <TabsTrigger value="join">Join Game</TabsTrigger>
                    </TabsList>

                    {/* Create Game Tab */}
                    <TabsContent value="create">
                        <div className="space-y-4 pt-4">
                            <div>
                                <Label>Starting Life</Label>
                                <Select
                                    value={startingLife}
                                    onValueChange={setStartingLife}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select starting life" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="40">40</SelectItem>
                                        <SelectItem value="custom">
                                            Custom
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {startingLife === "custom" && (
                                    <Input
                                        type="number"
                                        placeholder="Enter custom life total"
                                        className="mt-2"
                                    />
                                )}
                            </div>

                            <div>
                                <Label>Free Mulligans</Label>
                                <div className="flex items-center space-x-4">
                                    <Slider
                                        value={[freeMulligans]}
                                        onValueChange={(value) =>
                                            setFreeMulligans(value[0])
                                        }
                                        max={5}
                                        step={1}
                                        className="w-full"
                                    />
                                    <span className="w-12 text-center">
                                        {freeMulligans === 5
                                            ? "∞"
                                            : freeMulligans}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="scry-rule"
                                    checked={scryRule}
                                    onCheckedChange={setScryRule}
                                />
                                <Label htmlFor="scry-rule">Scry Rule</Label>
                            </div>

                            <Button
                                onClick={handleCreateGame}
                                className="w-full"
                            >
                                {loading ? "loading..." : "Create Game"}
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Join Game Tab */}
                    <TabsContent value="join">
                        <div className="space-y-4 pt-4">
                            <Label>Game Code</Label>
                            <div className="flex">
                                <InputOTP
                                    maxLength={6}
                                    value={gameCode}
                                    onChange={setGameCode}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSeparator />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                                <Button
                                    size="icon"
                                    variant={
                                        clipboard === null
                                            ? "outline"
                                            : "default"
                                    }
                                    disabled={clipboard === null}
                                    onClick={() => {
                                        if (clipboard) setGameCode(clipboard);
                                    }}
                                >
                                    <ClipboardPaste />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    onClick={() => setGameCode("")}
                                >
                                    <X />
                                </Button>
                            </div>

                            <Button
                                onClick={handleJoinGame}
                                className="w-full"
                                disabled={gameCode.length !== 6}
                            >
                                Join Game
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
