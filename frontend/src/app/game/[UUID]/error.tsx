"use client";

import { Button } from "@/components/(ui)/button";
import Link from "next/link";

export default function GameError() {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold mb-4">404</h1>
                <p className="text-xl mb-6">Game Not Found</p>
                <p className="text-gray-400 mb-6">
                    Sorry, we couldn’t find the game you were looking for.
                </p>
                <Link href="/">
                    <Button variant="ghost">Go Home</Button>
                </Link>
            </div>
        </div>
    );
}
