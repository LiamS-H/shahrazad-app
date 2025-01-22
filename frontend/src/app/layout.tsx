import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/(theme)/theme-provider";
import NavBar from "./navbar";
import ScrycardsContext from "@/contexts/scrycards";
import { Toaster } from "@/components/(ui)/sonner";
import { TooltipProvider } from "@/components/(ui)/tooltip";
import { FullscreenContextProvider } from "@/contexts/fullscreen";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Shahrazad",
    description: "A new way to play.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className="h-full w-full">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased h-full w-full flex flex-col`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    // disableTransitionOnChange
                >
                    <TooltipProvider>
                        <ScrycardsContext>
                            <FullscreenContextProvider>
                                <NavBar />
                                {children}
                            </FullscreenContextProvider>
                        </ScrycardsContext>
                    </TooltipProvider>
                    <Toaster position="bottom-center" />
                </ThemeProvider>
            </body>
        </html>
    );
}
