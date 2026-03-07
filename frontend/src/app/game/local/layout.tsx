import { Suspense, type ReactNode } from "react";
import LoadingGame from "../[UUID]/loading";

export default function GameConfigLayout({
    children,
}: {
    children: ReactNode;
}) {
    return <Suspense fallback={<LoadingGame />}>{children}</Suspense>;
}
