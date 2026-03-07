"use client";
import { UserProfile } from "@/components/(ui)/user-profile";
import { ThemeToggle } from "@/components/(theme)/theme-toggle";
import { Button } from "@/components/(ui)/button";
import { useFullscreen } from "@/contexts/fullscreen";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function NavBar() {
    const { isFullscreen } = useFullscreen();
    const path = usePathname();
    const inGame =
        path.startsWith("/game/") &&
        !path.startsWith("/game?tab=create") &&
        !path.startsWith("/game?tab=join");
    const inLocal = path.startsWith("/game/local");

    return (
        <nav className={` ${isFullscreen ? "hidden" : ""}`}>
            <ul className="p-4 flex flex-row items-center gap-4">
                <li>
                    <Link href={"/"}>
                        <Button
                            className={path == "/" ? "text-highlight" : ""}
                            variant="link"
                        >
                            Home
                        </Button>
                    </Link>
                </li>
                <li>
                    <Suspense
                        fallback={
                            <Link href={"/game"}>
                                <Button
                                    variant="link"
                                    className={
                                        path.startsWith("/game")
                                            ? "text-highlight"
                                            : undefined
                                    }
                                >
                                    Game
                                </Button>
                            </Link>
                        }
                    >
                        <GameLink
                            active={path.startsWith("/game") && !inLocal}
                        />
                    </Suspense>
                </li>
                <li>
                    <Link href={"/game/local"}>
                        <Button
                            className={
                                path.startsWith("/game/local")
                                    ? "text-highlight"
                                    : undefined
                            }
                            variant="link"
                        >
                            Local Playtest
                        </Button>
                    </Link>
                </li>
                <li>
                    <ThemeToggle />
                </li>
                {!inGame && (
                    <li className="ml-auto">
                        <UserProfile />
                    </li>
                )}
            </ul>
        </nav>
    );
}

function GameLink({ active }: { active: boolean }) {
    const searchParams = useSearchParams();
    const currentTab = searchParams.get("tab");
    return (
        <Link href={currentTab ? `/game?tab=create` : "/game"}>
            <Button
                className={active ? "text-highlight" : undefined}
                variant="link"
            >
                Game
            </Button>
        </Link>
    );
}
