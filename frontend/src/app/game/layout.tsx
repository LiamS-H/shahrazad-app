"use client";

import { Card, CardContent } from "@/components/(ui)/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/(ui)/tabs";
import { useRouter, usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function GameConfigLayout({
    children,
}: {
    children: ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const currentTab = pathname === "/game/join" ? "join" : "create";

    const handleTabChange = (value: string) => {
        router.push(`/game/${value}`);
    };

    return (
        <div className="w-full h-full flex justify-center items-start pt-12">
            <Card className="container min-w-96 max-w-md">
                <CardContent className="pt-6">
                    <Tabs value={currentTab} onValueChange={handleTabChange}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="create">
                                Create Game
                            </TabsTrigger>
                            <TabsTrigger value="join">Join Game</TabsTrigger>
                        </TabsList>
                        {children}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
