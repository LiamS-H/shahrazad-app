import { Suspense, type ReactNode } from "react";
import JoinGameLoading from "./loading";

export default function JoinGameLayout({ children }: { children: ReactNode }) {
    return <Suspense fallback={<JoinGameLoading />}>{children}</Suspense>;
}
