"use client";

import { useEffect, useRef } from "react";

/**
 * Matrix-style falling ASCII characters.
 * Used as a section-specific background (e.g., Challenge section).
 */

const CHARS = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン@#$%&*!?";

interface AsciiRainProps {
  /** CSS color for the characters (default: red) */
  color?: [number, number, number];
  /** Opacity of the overall effect */
  opacity?: number;
  /** Density of columns (higher = more columns) */
  density?: number;
  className?: string;
}

export function AsciiRain({
  color = [239, 68, 68],
  opacity = 0.3,
  density = 1,
  className,
}: AsciiRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0,
      h = 0;
    const fontSize = 14;
    let columns = 0;
    let drops: number[] = [];

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const newCols = Math.floor((w / fontSize) * density);
      // Preserve existing drops, add new ones for added columns
      const newDrops = Array.from({ length: newCols }, (_, i) =>
        i < drops.length ? drops[i] : Math.random() * -50
      );
      drops = newDrops;
      columns = newCols;
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf: number;

    const draw = () => {
      // Semi-transparent overlay for trailing effect
      ctx.fillStyle = `rgba(10, 12, 16, 0.06)`;
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${fontSize}px var(--font-mono, monospace)`;

      for (let i = 0; i < columns; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = (i / density) * fontSize;
        const y = drops[i] * fontSize;

        // Head character is brighter
        const isHead = true;
        const brightness = isHead ? 1 : 0.4 + Math.random() * 0.3;
        ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${brightness * 0.5})`;
        ctx.fillText(char, x, y);

        // Bright head glow
        ctx.fillStyle = `rgba(255, 255, 255, ${0.15})`;
        ctx.fillText(char, x, y);

        // Reset drop when it goes off screen
        if (drops[i] * fontSize > h && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.4 + Math.random() * 0.6;
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [color, density, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}
