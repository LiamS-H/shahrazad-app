"use client";

import { useEffect, useState } from "react";
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
import GameSettingLoading from "./loading";
import { ShahrazadGameSettings } from "@/types/bindings/game";

export interface GameSettings extends Omit<
    ShahrazadGameSettings,
    "starting_life"
> {
    starting_life: string;
    custom_starting_life: string;
}

export function GameSettings(_props: {
    onSubmit: (settings: ShahrazadGameSettings) => void;
    submitButtonText: string;
    isLoading?: boolean;
    initialSettings: GameSettings | null;
}) {
    const { initialSettings, ...props } = _props;
    if (initialSettings == null) return <GameSettingLoading />;

    return (
        <GameSettingsContent initialGameSettings={initialSettings} {...props} />
    );
}

function GameSettingsContent({
    onSubmit,
    submitButtonText,
    isLoading,
    initialGameSettings,
}: {
    onSubmit: (settings: ShahrazadGameSettings) => void;
    submitButtonText: string;
    isLoading?: boolean;
    initialGameSettings: GameSettings;
}) {
    const [settings, setSettings] = useState<GameSettings>(initialGameSettings);

    useEffect(() => {
        try {
            const {
                commander,
                custom_starting_life,
                free_mulligans,
                scry_rule,
                starting_life,
            } = settings;
            localStorage.setItem(
                "default-game-startingLife",
                JSON.stringify(starting_life),
            );
            localStorage.setItem(
                "default-game-customLife",
                JSON.stringify(custom_starting_life),
            );
            localStorage.setItem(
                "default-game-freeMulligans",
                JSON.stringify(free_mulligans),
            );
            localStorage.setItem(
                "default-game-command",
                JSON.stringify(commander),
            );
            localStorage.setItem(
                "default-game-scryRule",
                JSON.stringify(scry_rule),
            );
        } catch (error) {
            console.error("Failed to sync settings to localStorage", error);
        }
    }, [settings]);

    const updateField = <K extends keyof GameSettings>(
        key: K,
        value: GameSettings[K],
    ) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        const {
            starting_life,
            custom_starting_life,
            commander,
            free_mulligans,
            scry_rule,
        } = settings;

        let lifeNum =
            starting_life === "custom"
                ? Number(custom_starting_life)
                : Number(starting_life);
        if (Number.isNaN(lifeNum) || lifeNum < 0) lifeNum = 20;

        onSubmit({
            commander,
            free_mulligans,
            scry_rule,
            starting_life: lifeNum,
        });
    };

    return (
        <div className="space-y-4 pt-4">
            {/* Starting Life */}
            <div>
                <Label>Starting Life</Label>
                <div className="flex gap-2 items-start">
                    <Select
                        value={settings.starting_life}
                        onValueChange={(val) =>
                            updateField("starting_life", val)
                        }
                    >
                        <SelectTrigger className="min-w-36 w-36">
                            <SelectValue placeholder="Select starting life" />
                        </SelectTrigger>
                        <SelectContent className="w-36">
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="40">40</SelectItem>
                            <SelectItem value="custom">
                                Custom{" "}
                                {settings.custom_starting_life
                                    ? `- ${settings.custom_starting_life}`
                                    : ""}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    {settings.starting_life === "custom" && (
                        <Input
                            type="number"
                            placeholder="Enter custom life total"
                            value={settings.custom_starting_life}
                            onChange={(e) =>
                                updateField(
                                    "custom_starting_life",
                                    e.target.value,
                                )
                            }
                        />
                    )}
                </div>
            </div>

            {/* Mulligans */}
            <div>
                <Label>Free Mulligans</Label>
                <div className="flex items-center space-x-4">
                    <Slider
                        value={[settings.free_mulligans]}
                        onValueChange={(val) =>
                            updateField("free_mulligans", val[0])
                        }
                        max={5}
                        step={1}
                        className="w-full"
                    />
                    <span className="w-12 text-center">
                        {settings.free_mulligans === 5
                            ? "∞"
                            : settings.free_mulligans}
                    </span>
                </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center space-x-2">
                <Switch
                    id="command-game"
                    checked={settings.commander}
                    onCheckedChange={(val) => updateField("commander", val)}
                />
                <Label htmlFor="command-game">Commander</Label>
                {settings.commander && (
                    <>
                        <Switch
                            id="scry-rule"
                            checked={settings.scry_rule}
                            onCheckedChange={(val) =>
                                updateField("scry_rule", val)
                            }
                        />
                        <Label htmlFor="scry-rule">Scry Rule</Label>
                    </>
                )}
            </div>

            <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={
                    isLoading ||
                    (settings.starting_life === "custom" &&
                        !settings.custom_starting_life)
                }
            >
                {isLoading ? "loading..." : submitButtonText}
            </Button>
        </div>
    );
}
