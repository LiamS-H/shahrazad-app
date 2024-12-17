"use client";
import { ReactNode } from "react";
import { ScrycardsContextProvider } from "react-scrycards";

export default function ScrycardsContext(props: { children: ReactNode }) {
    return (
        <ScrycardsContextProvider>{props.children}</ScrycardsContextProvider>
    );
}
