"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { Slider } from "@/components/(ui)/slider";
import { createGame } from "@/lib/client/createGame";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClipboardPaste, X } from "lucide-react";
import { joinGame } from "@/lib/client/joinGame";
import { CodeInput } from "../../../app/game/join/code-input";
import { Form } from "@/components/(ui)/form";

export default function GameForm() {
    const [tab, setTab] = useState("create");

    return (
        <Card className="container min-w-96 max-w-md">
            <CardContent className="pt-6">
                <Tabs
                    defaultValue="create"
                    className="w-full"
                    value={tab}
                    onValueChange={setTab}
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="create">Create Game</TabsTrigger>
                        <TabsTrigger value="join">Join Game</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardContent>
        </Card>
    );
}
