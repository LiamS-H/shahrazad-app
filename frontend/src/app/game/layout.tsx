"use client";
import { Card, CardContent } from "@/components/(ui)/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/(ui)/tabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";

function GameConfigTabs({ children }: { children: ReactNode }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get("tab") || "create";

    const handleTabChange = (value: string) => {
        router.push(`/game?tab=${value}`);
    };

    return (
        <Tabs value={currentTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create Game</TabsTrigger>
                <TabsTrigger value="join">Join Game</TabsTrigger>
            </TabsList>
            {children}
        </Tabs>
    );
}

export default function GameConfigLayout({
    children,
}: {
    children: ReactNode;
}) {
    const path = usePathname();

    if (path !== "/game") return children;

    return (
        <div className="w-full h-full flex justify-center items-start pt-12">
            <Card className="container min-w-96 max-w-md">
                <CardContent className="pt-6">
                    <Suspense
                        fallback={
                            <div className="h-64 animate-pulse bg-muted rounded-md" />
                        }
                    >
                        <GameConfigTabs>{children}</GameConfigTabs>
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
