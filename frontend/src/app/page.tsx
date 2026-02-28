"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { GridCanvas } from "./_components/GridCanvas";
import { SweepButton } from "./_components/SweepButton";
import { OutlineButton } from "./_components/OutlineButton";
import { Import, UserRoundX, Zap } from "lucide-react";
import { GithubIcon } from "./_components/GithubIcon";

export default function Home() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <div className="relative   overflow-x-hidden">
            {mounted && <GridCanvas />}

            {/* ===== HERO ===== */}
            <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
                <motion.p
                    className="text-highlight/50 text-xs tracking-[0.4em] uppercase font-bold mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.0 }}
                >
                    Fast & Free Multiplayer Playtester
                </motion.p>

                <motion.h1
                    className="font-[family-name:var(--font-title)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-none select-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    ShahrazaD
                </motion.h1>

                {/* CTA — sweep button like original */}
                <motion.div
                    className="mt-10 flex items-center gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Link href="/game">
                        <SweepButton>Start Playing</SweepButton>
                    </Link>
                    <Link href="/game?tab=join">
                        <OutlineButton>Join a Game</OutlineButton>
                    </Link>
                </motion.div>

                {/* 0-1-2-3 Steps */}
                <motion.div
                    className="mt-24 grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-10 max-w-3xl w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    {[
                        {
                            num: "0",
                            title: "Account",
                            desc: "none needed.",
                        },
                        { num: "1", title: "Create", desc: "start a game." },
                        {
                            num: "2",
                            title: "Share",
                            desc: "easy link sharing.",
                        },
                        {
                            num: "3",
                            title: "Play",
                            desc: "together, instantly!",
                        },
                    ].map((s, i) => (
                        <motion.div
                            key={s.num}
                            className="text-center"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 1.3 + i * 0.1 }}
                        >
                            <div className="text-highlight/30 text-4xl md:text-5xl font-black mb-2 font-[family-name:var(--font-title)]">
                                {s.num}
                            </div>
                            <div className="text-muted-foreground font-bold text-sm mb-0.5">
                                {s.title}
                            </div>
                            <div className="text-muted-foreground/50 text-xs">
                                {s.desc}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ===== WHY SHAHRAZAD ===== */}
            <section className="relative z-10 py-24 px-6 md:px-16 border-t border-foreground/5">
                <div className="max-w-4xl mx-auto">
                    <motion.h2
                        className="font-[family-name:var(--font-title)] text-2xl md:text-3xl mb-4"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        for your Playgroup
                    </motion.h2>
                    <motion.p
                        className="text-muted-foreground/50 text-sm mb-12 max-w-lg"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        Whether you&apos;re testing a new brew, running a
                        Commander pod, or playing your drafted decks — Shahrazad
                        handles it.
                    </motion.p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-white/5">
                        {[
                            {
                                icon: <Import />,
                                title: "Bring Your Deck",
                                desc: "Import decks with one click from all the popular deckbuilding websites, or paste in a decklist directly.",
                            },
                            {
                                icon: <Zap />,
                                title: "Instant Actions",
                                // desc: "Tap a land, cast a spell, move to combat. Every action resolves instantly — no waiting for server round-trips.",
                                desc: "Tap a land, cast a spell, target a creature. Every action resolves instantly — no waiting for server round-trips.",
                            },
                            {
                                icon: <UserRoundX />,
                                title: "No Barriers",
                                desc: "No accounts, no downloads, no browser extensions. Just share a game link and everyone is in.",
                            },
                            {
                                icon: <GithubIcon />,
                                title: "Open Forever",
                                desc: "No paywalls. No ads. The entire project is open source and always will be.",
                            },
                        ].map((f, i) => (
                            <motion.div
                                key={f.title}
                                className="group bg-background p-6 hover:bg-highlight/[0.05] transition-colors duration-300"
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                            >
                                <h3 className="flex gap-2 items-center text-foreground font-bold text-sm mb-2 tracking-wide uppercase">
                                    {f.icon}
                                    {f.title}
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {f.desc}
                                </p>
                                <div className="mt-4 h-[2px] w-0 bg-highlight group-hover:w-full transition-all duration-500" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== PRACTICE SOLO ===== */}
            <section className="relative z-10 py-24 px-6 md:px-16 border-t border-white/5">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-highlight/40 text-[10px] tracking-[0.4em] uppercase font-bold mb-4 block">
                            Solo Mode
                        </span>
                        <h2 className="font-[family-name:var(--font-title)] text-2xl md:text-3xl mb-4">
                            Practice made Easy
                        </h2>
                        <p className="text-muted-foreground/50 text-sm leading-relaxed mb-4">
                            Don&apos;t need a full pod? Use local playtesting to
                            goldfish your deck, test opening hands, and practice
                            lines — all by yourself, right in your browser.
                        </p>
                        <p className="text-muted-foreground/50 text-sm leading-relaxed mb-6">
                            Game states can be{" "}
                            <span className="text-muted-foreground">
                                saved and shared as a link
                            </span>{" "}
                            — send a specific board state to a friend, or
                            bookmark a position to come back to later.
                        </p>
                        <Link href="/game/local">
                            <SweepButton>Practice Solo</SweepButton>
                        </Link>
                    </motion.div>

                    {/* Board state visual */}
                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <div className="border border-foreground/5 bg-foreground/[0.02] p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-highlight/40" />
                                <span className="text-foreground/20 text-[10px] tracking-widest uppercase">
                                    Saved Board State
                                </span>
                            </div>
                            {/* Mini board representation */}
                            <div className="grid grid-cols-7 gap-1 mb-4">
                                {Array.from({ length: 14 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="aspect-[5/7] bg-highlight/[0.04] border border-highlight/10"
                                        style={{
                                            opacity:
                                                Math.random() > 0.3 ? 1 : 0.3,
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-[1px] bg-foreground/5" />
                                <span className="text-foreground/15 text-[9px] tracking-widest">
                                    SHAREABLE LINK
                                </span>
                                <div className="flex-1 h-[1px] bg-foreground/5" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ===== PERFORMANCE / TECHNICAL ===== */}
            <section className="relative z-10 py-24 px-6 md:px-16 border-t border-white/5">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-highlight/40 text-[10px] tracking-[0.4em] uppercase font-bold mb-4 block">
                            Under the Hood
                        </span>
                        <h2 className="font-[family-name:var(--font-title)] text-2xl md:text-3xl mb-4">
                            Built for speed
                        </h2>
                        <p className="text-muted-foreground/50 text-sm mb-16 max-w-lg">
                            Shahrazad isn&apos;t just fast to use — it&apos;s
                            engineered to be fast at every level of the stack.
                        </p>
                    </motion.div>

                    {/* Performance stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-[1px] bg-white/5 mb-12">
                        {[
                            {
                                value: "<80",
                                unit: "bytes",
                                label: "Action packet size",
                                detail: "Each game action is serialized into a tiny binary packet — smaller than a tweet.",
                            },
                            {
                                value: "~2",
                                unit: "MB",
                                label: "Memory footprint",
                                detail: "The full WASM game engine runs in roughly 2MB of memory. Lighter than a single card image.",
                            },
                            {
                                value: "<1",
                                unit: "ms",
                                label: "State compute",
                                detail: "Game state transitions are computed locally in WebAssembly — near-native speed, zero round-trips.",
                            },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                className="bg-background p-6"
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                            >
                                <div className="flex items-baseline gap-1 mb-3">
                                    <span className="text-highlight text-3xl md:text-4xl font-black tracking-tight">
                                        {stat.value}
                                    </span>
                                    <span className="text-highlight/50 text-sm font-bold">
                                        {stat.unit}
                                    </span>
                                </div>
                                <h3 className="text-muted-foreground text-xs tracking-[0.2em] uppercase font-bold mb-2">
                                    {stat.label}
                                </h3>
                                <p className="text-muted-foreground/50 text-sm leading-relaxed">
                                    {stat.detail}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Architecture row */}
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-8"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        {[
                            { label: "Engine", value: "Rust → WASM" },
                            { label: "Backend", value: "Rust" },
                            { label: "Frontend", value: "React / Next.js" },
                            { label: "Sync", value: "WebSocket" },
                        ].map((item) => (
                            <div key={item.label}>
                                <div className="text-foreground/15 text-[9px] tracking-[0.3em] uppercase font-bold mb-1">
                                    {item.label}
                                </div>
                                <div className="text-foreground/50 text-sm font-bold">
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ===== OPEN SOURCE / GITHUB ===== */}
            <section className="relative z-10 py-24 px-6 md:px-16 border-t border-foreground/5">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Github icon / visual */}
                    <motion.div
                        className="order-2 md:order-1"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="border border-foreground/5 bg-foreground/[0.02] p-6">
                            <div className="flex items-center text-foreground/40 gap-3 mb-4">
                                {/* GitHub icon */}
                                <GithubIcon />
                                <span className="text-sm font-bold">
                                    LiamS-H / shahrazad-app
                                </span>
                            </div>
                            <p className="text-foreground/20 text-sm leading-relaxed mb-4">
                                The full source code — game engine, backend, and
                                frontend — is free and open.
                            </p>
                            <div className="flex gap-4 mb-4">
                                {[
                                    {
                                        label: "Rust",
                                        color: "bg-orange-400/60",
                                    },
                                    {
                                        label: "TypeScript",
                                        color: "bg-blue-400/60",
                                    },
                                    {
                                        label: "WASM",
                                        color: "bg-purple-400/60",
                                    },
                                ].map((lang) => (
                                    <div
                                        key={lang.label}
                                        className="flex items-center gap-1.5"
                                    >
                                        <div
                                            className={`w-2 h-2 ${lang.color}`}
                                        />
                                        <span className="text-foreground/25 text-[10px]">
                                            {lang.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="h-[1px] bg-foreground/5 mb-4" />
                            <div className="flex gap-6">
                                {[
                                    { label: "Engine", path: "/shared" },
                                    { label: "Backend", path: "/backend" },
                                    { label: "Frontend", path: "/frontend" },
                                    { label: "WASM", path: "/wasm" },
                                ].map((dir) => (
                                    <span
                                        key={dir.path}
                                        className="text-foreground/15 text-[10px] font-mono"
                                    >
                                        {dir.path}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="order-1 md:order-2"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <span className="text-highlight/40 text-[10px] tracking-[0.4em] uppercase font-bold mb-4 block">
                            Open Source
                        </span>
                        <h2 className="font-[family-name:var(--font-title)] text-2xl md:text-3xl mb-4">
                            Built in the open
                        </h2>
                        <p className="text-muted-foreground/50 text-sm leading-relaxed mb-4">
                            The entire codebase — the Rust game engine, the
                            WebSocket backend, the React frontend, and the WASM
                            compiler — is open source and available on GitHub.
                        </p>
                        <p className="text-muted-foreground/50 text-sm leading-relaxed mb-6">
                            Inspect the code, report bugs, contribute features,
                            or fork the entire project and run your own
                            instance. It&apos;s your game.
                        </p>
                        <a
                            href="https://github.com/LiamS-H/shahrazad-app"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <OutlineButton>View on GitHub →</OutlineButton>
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* ===== FINAL CTA — "Stop reading. Start playing." ===== */}
            <section className="relative z-10 py-32 px-6 text-center border-t border-white/5">
                <motion.h2
                    className="text-4xl md:text-6xl tracking-tight mb-8"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    Stop reading.
                    <br />
                    <span className="text-highlight">Start playing.</span>
                </motion.h2>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Link href="/game">
                        <SweepButton className="tracking-[0.15em] uppercase">
                            Play Now
                        </SweepButton>
                    </Link>
                </motion.div>
                <motion.p
                    className="mt-12 text-muted-foreground text-[9px] tracking-[0.2em] uppercase"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    Not affiliated with Wizards of the Coast
                </motion.p>
            </section>
        </div>
    );
}
