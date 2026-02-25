import type { Metadata } from "next";
import { Major_Mono_Display, Quicksand } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/(theme)/theme-provider";
import NavBar from "./navbar";
import ScrycardsContext from "@/contexts/scrycards";
import { Toaster } from "@/components/(ui)/sonner";
import { TooltipProvider } from "@/components/(ui)/tooltip";
import { FullscreenContextProvider } from "@/contexts/fullscreen";
import { DeviceContextProvider } from "@/contexts/device";
import { init_wasm } from "@/lib/client/wasm-init";

const fontMain = Quicksand({
    variable: "--font-main",
    weight: ["400", "600"],
    subsets: ["latin"],
});

const fontTitle = Major_Mono_Display({
    variable: "--font-title",
    weight: ["400"],
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Shahrazad",
    description: "A free fast multiplayer playtester.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    init_wasm();
    return (
        <html lang="en" suppressHydrationWarning className="h-full w-full">
            <body
                className={`${fontMain.variable} ${fontTitle.variable} font-[family-name:var(--font-main)] antialiased h-full w-full flex flex-col`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <TooltipProvider>
                        <DeviceContextProvider>
                            <FullscreenContextProvider>
                                <ScrycardsContext>
                                    <NavBar />
                                    {children}
                                </ScrycardsContext>
                            </FullscreenContextProvider>
                        </DeviceContextProvider>
                    </TooltipProvider>
                    <Toaster position="bottom-center" />
                </ThemeProvider>
            </body>
        </html>
    );
}
