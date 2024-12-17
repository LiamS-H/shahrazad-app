import Link from "next/link";

export default function NavBar() {
    return (
        <nav>
            <ul>
                <Link href={"/"}>Home</Link>
                <Link href={"/game"}>Game</Link>
            </ul>
        </nav>
    );
}
