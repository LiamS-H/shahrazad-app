import { Suspense, type ReactNode } from "react";
import CreateGameLoading from "./loading";

export default function CreateGameLayout({
    children,
}: {
    children: ReactNode;
}) {
    return <Suspense fallback={<CreateGameLoading />}>{children}</Suspense>;
}
