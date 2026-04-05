"use client";

import { useEffect, useRef } from "react";

// ASCII characters sorted by visual density (light → heavy)
const CHARS = " .,:;+*?%S#@";

export function AsciiTorus() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0,
      h = 0,
      cols = 0,
      rows = 0;

    // Responsive character cell sizing
    const getCellSize = () => {
      const vw = window.innerWidth;
      if (vw < 640) return { w: 6, h: 11 };
      if (vw < 1024) return { w: 7, h: 13 };
      return { w: 8, h: 15 };
    };

    let cell = getCellSize();

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = getCellSize();
      cols = Math.floor(w / cell.w);
      rows = Math.floor(h / cell.h);
    };
    resize();
    window.addEventListener("resize", resize);

    // Torus parameters
    const R1 = 1; // tube radius
    const R2 = 2; // torus radius

    let A = 0,
      B = 0;

    // Pre-allocated buffers (max practical size)
    const MAX_CELLS = 400 * 200;
    const charBuf = new Int8Array(MAX_CELLS);
    const zBuf = new Float32Array(MAX_CELLS);

    // Sparkle system for digital atmosphere
    const sparkles: { x: number; y: number; life: number; char: string }[] = [];
    const SPARKLE_CHARS = "*+~.:";

    const startTime = performance.now();
    let raf: number;

    const draw = () => {
      // Fade-in over first 2 seconds
      const elapsed = performance.now() - startTime;
      const fadeIn = Math.min(1, elapsed / 2000);

      // Mouse-influenced rotation
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      A += 0.04 + (my - 0.5) * 0.02;
      B += 0.02 + (mx - 0.5) * 0.03;

      const cosA = Math.cos(A),
        sinA = Math.sin(A);
      const cosB = Math.cos(B),
        sinB = Math.sin(B);

      const K2 = 5;
      const K1 = (Math.min(cols, rows * 2) * K2 * 0.35) / (R1 + R2);

      const cellCount = cols * rows;
      charBuf.fill(-1, 0, cellCount);
      zBuf.fill(0, 0, cellCount);

      // Sample torus surface
      for (let theta = 0; theta < 6.283; theta += 0.07) {
        const cosT = Math.cos(theta),
          sinT = Math.sin(theta);

        for (let phi = 0; phi < 6.283; phi += 0.02) {
          const cosP = Math.cos(phi),
            sinP = Math.sin(phi);

          const cx = R2 + R1 * cosT;
          const cy = R1 * sinT;

          // Apply rotations (A around X-axis, B around Z-axis)
          const x =
            cx * (cosB * cosP + sinA * sinB * sinP) - cy * cosA * sinB;
          const y =
            cx * (sinB * cosP - sinA * cosB * sinP) + cy * cosA * cosB;
          const z = K2 + cosA * cx * sinP + cy * sinA;
          const ooz = 1 / z;

          // Perspective projection (0.5 y-scale for char aspect ratio)
          const xp = Math.floor(cols / 2 + K1 * ooz * x);
          const yp = Math.floor(rows / 2 - K1 * ooz * y * 0.5);

          if (xp >= 0 && xp < cols && yp >= 0 && yp < rows) {
            const idx = yp * cols + xp;
            if (ooz > zBuf[idx]) {
              zBuf[idx] = ooz;
              // Surface normal luminance
              const L =
                cosP * cosT * sinB -
                cosA * cosT * sinP -
                sinA * sinT +
                cosB * (cosA * sinT - cosT * sinA * sinP);
              // Map luminance [-sqrt(2), sqrt(2)] → char index
              const normalized = (L + 1.414) / 2.828;
              charBuf[idx] = Math.max(
                0,
                Math.min(
                  CHARS.length - 1,
                  Math.floor(normalized * (CHARS.length - 1) + 0.5)
                )
              );
            }
          }
        }
      }

      // Render to canvas
      ctx.clearRect(0, 0, w, h);
      ctx.font = `${cell.h - 2}px var(--font-mono, monospace)`;
      ctx.textBaseline = "top";

      // Draw torus characters
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = y * cols + x;
          const ci = charBuf[idx];
          if (ci >= 0) {
            const brightness = ci / (CHARS.length - 1);
            ctx.fillStyle = `rgba(224, 90, 56, ${(0.1 + brightness * 0.9) * fadeIn})`;
            ctx.fillText(CHARS[ci], x * cell.w, y * cell.h);
          }
        }
      }

      // Sparkle system - digital particles near the torus
      if (fadeIn > 0.5 && Math.random() < 0.35) {
        // Find a random occupied cell to spawn near
        const attempts = 10;
        for (let a = 0; a < attempts; a++) {
          const rx = Math.floor(Math.random() * cols);
          const ry = Math.floor(Math.random() * rows);
          if (charBuf[ry * cols + rx] >= 0) {
            sparkles.push({
              x: rx + (Math.random() - 0.5) * 4,
              y: ry + (Math.random() - 0.5) * 4,
              life: 1,
              char: SPARKLE_CHARS[
                Math.floor(Math.random() * SPARKLE_CHARS.length)
              ],
            });
            break;
          }
        }
      }

      // Draw and update sparkles
      for (let i = sparkles.length - 1; i >= 0; i--) {
        sparkles[i].life -= 0.025;
        if (sparkles[i].life <= 0) {
          sparkles.splice(i, 1);
          continue;
        }
        const s = sparkles[i];
        ctx.fillStyle = `rgba(240, 110, 80, ${s.life * 0.6 * fadeIn})`;
        ctx.fillText(s.char, s.x * cell.w, s.y * cell.h);
      }

      // Cap sparkle count
      while (sparkles.length > 40) sparkles.shift();

      raf = requestAnimationFrame(draw);
    };

    draw();

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", onMouse);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.45 }}
      aria-hidden="true"
    />
  );
}
