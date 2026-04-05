"use client";

import { useEffect, useRef } from "react";

/**
 * Full-page overlay that spawns ASCII character bursts on click.
 * Characters explode outward from the click point and fade away.
 */

const BURST_CHARS = "@#$%&*!?+=-~<>{}[]|/\\^.:;";
const COLORS = [
  [224, 90, 56],   // accent
  [20, 184, 166],  // teal
  [6, 182, 212],   // cyan
  [240, 110, 80],  // accent-light
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  life: number;
  color: number[];
  size: number;
  rotation: number;
  rotSpeed: number;
}

export function AsciiClickBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const raf = useRef(0);
  const active = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const spawnBurst = (x: number, y: number) => {
      const count = 12 + Math.floor(Math.random() * 10);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
        const speed = 2 + Math.random() * 5;
        particles.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1, // slight upward bias
          char: BURST_CHARS[Math.floor(Math.random() * BURST_CHARS.length)],
          life: 1,
          color,
          size: 10 + Math.random() * 8,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.3,
        });
      }

      if (!active.current) {
        active.current = true;
        animate();
      }
    };

    const animate = () => {
      const ps = particles.current;
      if (ps.length === 0) {
        active.current = false;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        return;
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.vx *= 0.98; // drag
        p.vy *= 0.98;
        p.life -= 0.018;
        p.rotation += p.rotSpeed;

        if (p.life <= 0) {
          ps.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `bold ${p.size}px var(--font-mono, monospace)`;
        ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.life * 0.9})`;

        // Glow effect via shadow
        ctx.shadowColor = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.life * 0.4})`;
        ctx.shadowBlur = 8;

        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      }

      raf.current = requestAnimationFrame(animate);
    };

    const onClick = (e: MouseEvent) => {
      spawnBurst(e.clientX, e.clientY);
    };

    window.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9997 }}
      aria-hidden="true"
    />
  );
}
