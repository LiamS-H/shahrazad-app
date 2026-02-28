"use client";
import { useRef, useEffect } from "react";

// Design 6: "The Gathering" — Warm, social, community-focused
// Tessellated grid from Design 1, flat buttons, rich scroll content
export function GridCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const draw = () => {
            time += 0.008;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const cellSize = 64;
            const cols = Math.ceil(canvas.width / cellSize) + 1;
            const rows = Math.ceil(canvas.height / cellSize) + 1;
            const centerCol = Math.floor(cols / 2);
            const centerRow = Math.floor(rows / 2);

            // Grid lines
            ctx.strokeStyle = "rgba(80, 180, 255, 0.06)";
            ctx.lineWidth = 1;
            for (let i = 0; i <= cols; i++) {
                ctx.beginPath();
                ctx.moveTo(i * cellSize, 0);
                ctx.lineTo(i * cellSize, canvas.height);
                ctx.stroke();
            }
            for (let j = 0; j <= rows; j++) {
                ctx.beginPath();
                ctx.moveTo(0, j * cellSize);
                ctx.lineTo(canvas.width, j * cellSize);
                ctx.stroke();
            }

            // Pulsing cells
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const distX = Math.abs(i - centerCol);
                    const distY = Math.abs(j - centerRow);
                    const dist = Math.sqrt(distX * distX + distY * distY);
                    const wave = Math.sin(time * 2 - dist * 0.4);
                    if (wave > 0.85) {
                        const alpha = (wave - 0.85) * 3;
                        ctx.fillStyle = `rgba(80, 180, 255, ${alpha * 0.08})`;
                        ctx.fillRect(
                            i * cellSize + 1,
                            j * cellSize + 1,
                            cellSize - 2,
                            cellSize - 2,
                        );
                    }
                }
            }

            // Crosshairs
            const cx = centerCol * cellSize;
            const cy = centerRow * cellSize;
            ctx.strokeStyle = `rgba(80, 180, 255, ${0.08 + Math.sin(time * 3) * 0.04})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx + cellSize / 2, 0);
            ctx.lineTo(cx + cellSize / 2, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, cy + cellSize / 2);
            ctx.lineTo(canvas.width, cy + cellSize / 2);
            ctx.stroke();

            animationId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
}
