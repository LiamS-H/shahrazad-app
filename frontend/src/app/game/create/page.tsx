"use client";
import { Button } from "@/components/(ui)/button";
import { Input } from "@/components/(ui)/input";
import { Label } from "@/components/(ui)/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/(ui)/select";
import { Slider } from "@/components/(ui)/slider";
import { Switch } from "@/components/(ui)/switch";
import { TabsContent } from "@/components/(ui)/tabs";
import { createGame } from "@/lib/client/createGame";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CreateGameLoading from "./loading";
import { loadPlayer, savePlayer } from "@/lib/client/localPlayer";

export default function CreateGameForm() {
    const { push: pushRoute } = useRouter();
    const [loading, setLoading] = useState(false);
    const [startingLife, setStartingLife] = useState("20");
    const [customStartingLife, setCustomStartingLife] = useState("");
    const [freeMulligans, setFreeMulligans] = useState(1);
    const [commanderGame, setCommanderGame] = useState(true);
    const [scryRule, setScryRule] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        const safeGetItem = (
            key: string,
            defaultValue: string | number | boolean,
        ) => {
            try {
                const item = localStorage.getItem(key);
                return item !== null ? JSON.parse(item) : defaultValue;
            } catch {
                return defaultValue;
            }
        };
        setStartingLife(safeGetItem("default-game-startingLife", "20"));
        setCustomStartingLife(safeGetItem("default-game-customLife", ""));
        setFreeMulligans(safeGetItem("default-game-freeMulligans", 1));
        setScryRule(safeGetItem("default-game-scryRule", false));
        setCommanderGame(safeGetItem("default-game-command", false));
    }, []);

    useEffect(() => {
        if (isClient) {
            try {
                localStorage.setItem(
                    "default-game-startingLife",
                    JSON.stringify(startingLife),
                );
                localStorage.setItem(
                    "default-game-customLife",
                    JSON.stringify(customStartingLife),
                );
                localStorage.setItem(
                    "default-game-freeMulligans",
                    JSON.stringify(freeMulligans),
                );
                localStorage.setItem(
                    "default-game-scryRule",
                    JSON.stringify(scryRule),
                );
                localStorage.setItem(
                    "default-game-command",
                    JSON.stringify(commanderGame),
                );
            } catch (error) {
                console.error("Failed to update localStorage", error);
            }
        }
    }, [
        startingLife,
        freeMulligans,
        scryRule,
        isClient,
        customStartingLife,
        commanderGame,
    ]);
    if (!isClient) {
        return <CreateGameLoading />;
    }

    const handleCreateGame = async () => {
        let starting_life: number;
        if (startingLife === "custom" && customStartingLife !== "") {
            starting_life = Number(customStartingLife);
        } else {
            starting_life = Number(startingLife);
        }
        if (Number.isNaN(starting_life) || starting_life < 0) {
            starting_life = 20;
        }
        setLoading(true);
        toast("Creating Game...");
        const gameResult = await createGame({
            settings: {
                starting_life,
                free_mulligans: freeMulligans.toString(),
                scry_rule: scryRule,
                commander: commanderGame,
            },
            player: loadPlayer()?.player,
        });
        if (gameResult === null) {
            setLoading(false);
            toast("Something went wrong.");
            return;
        }
        const { player_id, code } = gameResult;
        savePlayer(player_id);
        pushRoute(`/game/${code}`);
    };

    return (
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
                                {customStartingLife
                                    ? ` - ${customStartingLife}`
                                    : ""}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    {startingLife === "custom" && (
                        <Input
                            type="number"
                            placeholder="Enter custom life total"
                            className="mt-2"
                            value={customStartingLife}
                            onChange={(e) =>
                                setCustomStartingLife(e.target.value)
                            }
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
                            {freeMulligans === 5 ? "∞" : freeMulligans}
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="command-game"
                        checked={commanderGame}
                        onCheckedChange={setCommanderGame}
                    />
                    <Label htmlFor="command-game">Commander</Label>
                    {commanderGame && (
                        <>
                            <Switch
                                id="scry-rule"
                                checked={scryRule}
                                onCheckedChange={setScryRule}
                            />
                            <Label htmlFor="scry-rule">Scry Rule</Label>
                        </>
                    )}
                </div>

                <Button
                    onClick={handleCreateGame}
                    className="w-full"
                    disabled={
                        loading ||
                        (customStartingLife === "" && startingLife === "custom")
                    }
                >
                    {loading ? "loading..." : "Create Game"}
                </Button>
            </div>
        </TabsContent>
    );
}
