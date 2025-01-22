import { ThemeToggle } from "@/components/(theme)/theme-toggle";
import Link from "next/link";

export default function NavBar() {
    return (
        <nav>
            <ul className="p-4 flex flex-row items-center gap-4">
                <Link href={"/"}>Home</Link>
                <Link href={"/game/create"}>Game</Link>
                <ThemeToggle />
            </ul>
        </nav>
    );
}
