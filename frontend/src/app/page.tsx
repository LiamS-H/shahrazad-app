import { Button } from "@/components/(ui)/button";
import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col flex-grow justify-center items-center w-full font-[family-name:var(--font-geist-sans)]">
            <h1 className="text-9xl">Shahrazad</h1>
            <Link href={"/game/create"}>
                <Button>Get Started</Button>
            </Link>
        </div>
    );
}
