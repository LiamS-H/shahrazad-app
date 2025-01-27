"use client";
import { ThemeToggle } from "@/components/(theme)/theme-toggle";
import { Button } from "@/components/(ui)/button";
import { useFullscreen } from "@/contexts/fullscreen";
import Link from "next/link";

export default function NavBar() {
    const { isFullscreen } = useFullscreen();
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
                        <Button variant="link"> Game</Button>
                    </Link>
                </li>
                <li>
                    <ThemeToggle />
                </li>
            </ul>
        </nav>
    );
}
