import { Button } from "@/components/(ui)/button";
import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col flex-grow justify-center items-center w-full font-[family-name:var(--font-geist-sans)]">
            <h1 className="select-none text-7xl sm:text-8xl md:text-9xl">
                Shahrazad
            </h1>
            <Link href={"/game"}>
                <Button
                    variant="highlight"
                    className="group transition hover:scale-110 overflow-hidden relative"
                >
                    <span>Get Started</span>
                    <div className="absolute inset-0 flex h-full w-full [transform:skew(-12deg)_translateX(-100%)] justify-center group-hover:[transform:skew(-12deg)_translateX(100%)] group-hover:duration-1000">
                        <div className="relative h-full w-8 bg-gray-400/30"></div>
                    </div>
                </Button>
            </Link>
        </div>
    );
}
