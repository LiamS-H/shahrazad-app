"use client";
import { UserProfile } from "@/components/(ui)/user-profile";
import { ThemeToggle } from "@/components/(theme)/theme-toggle";
import { Button } from "@/components/(ui)/button";
import { useFullscreen } from "@/contexts/fullscreen";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
    const { isFullscreen } = useFullscreen();
    const path = usePathname();
    const inGame =
        path.startsWith("/game/") &&
        !path.startsWith("/game/create") &&
        !path.startsWith("/game/join");

    return (
        <nav className={`${isFullscreen ? "hidden" : ""}`}>
            <ul className="p-4 flex flex-row items-center gap-4">
                <li>
                    <Link href={"/"}>
                        <Button variant="link">Home</Button>
                    </Link>
                </li>
                <li>
                    <Link href={"/game/create"}>
                        <Button variant="link">Game</Button>
                    </Link>
                </li>
                <li>
                    <Link href={"/game/local"}>
                        <Button variant="link">Local Playtest</Button>
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
