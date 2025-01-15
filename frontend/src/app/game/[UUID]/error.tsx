"use client";

import { Button } from "@/components/(ui)/button";
import Link from "next/link";

export interface IErrorMessage {
    status: number;
    message: string;
    description: string;
}

export default function GameError({
    message: error,
}: {
    message: IErrorMessage;
}) {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold mb-4">{error.status}</h1>
                <p className="text-xl mb-6">{error.message}</p>
                <p className="text-gray-400 mb-6">{error.description}</p>
                <Link href="/">
                    <Button variant="ghost">Go Home</Button>
                </Link>
            </div>
        </div>
    );
}
