import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/(theme)/theme-provider";
import NavBar from "./navbar";
import ScrycardsContext from "@/contexts/scrycards";

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
                className={`${geistSans.variable} ${geistMono.variable} antialiased h-full w-full`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    // disableTransitionOnChange
                >
                    <ScrycardsContext>
                        <NavBar />
                        {children}
                    </ScrycardsContext>
                </ThemeProvider>
            </body>
        </html>
    );
}
