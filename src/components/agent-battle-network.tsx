"use client";

import { useEffect, useRef } from "react";

/* ── Character pools ────────────────────────────────────────────────── */

const NODE_CHARS = "@#$%&*+=~?!<>{}[]():;.|^/\\";
const AGENT_CHAR_MAP: Record<string, string> = {
  accent: "@",
  teal: "*",
  cyan: "#",
  red: "!",
};

/* ── Colors ─────────────────────────────────────────────────────────── */

const ACCENT = [224, 90, 56];
const RED = [239, 68, 68];
const TEAL = [20, 184, 166];
const CYAN = [6, 182, 212];

const AGENT_COLORS = [
  { rgb: ACCENT, key: "accent" },
  { rgb: TEAL, key: "teal" },
  { rgb: CYAN, key: "cyan" },
  { rgb: RED, key: "red" },
];

/* ── Types ──────────────────────────────────────────────────────────── */

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  hitTime: number;
  char: string;
  nextCharTime: number;
}

interface Agent {
  from: number;
  to: number;
  progress: number;
  speed: number;
  colorIdx: number;
}

/* ── Helpers ────────────────────────────────────────────────────────── */

function findEdge(nodes: Node[], maxDist: number): [number, number] {
  for (let a = 0; a < 60; a++) {
    const i = Math.floor(Math.random() * nodes.length);
    const j = Math.floor(Math.random() * nodes.length);
    if (i === j) continue;
    const dx = nodes[i].x - nodes[j].x;
    const dy = nodes[i].y - nodes[j].y;
    if (Math.sqrt(dx * dx + dy * dy) < maxDist) return [i, j];
  }
  return [0, Math.min(1, nodes.length - 1)];
}

function randomChar() {
  return NODE_CHARS[Math.floor(Math.random() * NODE_CHARS.length)];
}

/* ── Component ──────────────────────────────────────────────────────── */

export function AgentBattleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -1000, y: -1000 });
  const raf = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const NODE_COUNT = 120;
    const MAX_DIST = Math.min(w, h) * 0.18;
    const AGENT_COUNT = 30;

    const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      size: 1.2 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
      hitTime: -10,
      char: randomChar(),
      nextCharTime: Math.random() * 5 + 2,
    }));

    const agents: Agent[] = Array.from({ length: AGENT_COUNT }, () => {
      const [from, to] = findEdge(nodes, MAX_DIST);
      return {
        from,
        to,
        progress: Math.random(),
        speed: 0.002 + Math.random() * 0.004,
        colorIdx: Math.floor(Math.random() * AGENT_COLORS.length),
      };
    });

    let t = 0;

    // Hit-burst particles: characters that fly outward on hit
    const bursts: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      char: string;
      life: number;
      color: number[];
    }[] = [];

    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      // Update nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.phase += 0.015;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        // Mouse repulsion
        const dx = n.x - mouse.current.x;
        const dy = n.y - mouse.current.y;
        const md = Math.sqrt(dx * dx + dy * dy);
        if (md < 100 && md > 0) {
          const f = ((100 - md) / 100) * 0.4;
          n.x += (dx / md) * f;
          n.y += (dy / md) * f;
        }

        // Periodically change character (shimmer effect)
        n.nextCharTime -= 0.016;
        if (n.nextCharTime <= 0) {
          n.char = randomChar();
          n.nextCharTime = Math.random() * 4 + 2;
        }
      }

      // Draw edges as dashed ASCII-style connections
      ctx.setLineDash([3, 6]);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            const a = (1 - d / MAX_DIST) * 0.1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${a})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      ctx.setLineDash([]);

      // Draw nodes as ASCII characters
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const n of nodes) {
        const pulse = Math.sin(n.phase) * 0.3 + 0.7;
        const isHit = t - n.hitTime < 2;
        const fontSize = Math.floor(n.size * 5 + 6);

        if (isHit) {
          const p = (t - n.hitTime) / 2;
          // Expanding ring made of dots
          const ringRadius = p * 35;
          const ringChars = Math.floor(ringRadius * 0.5);
          ctx.font = `8px var(--font-mono, monospace)`;
          for (let k = 0; k < ringChars; k++) {
            const angle = (k / ringChars) * Math.PI * 2;
            const rx = n.x + Math.cos(angle) * ringRadius;
            const ry = n.y + Math.sin(angle) * ringRadius;
            ctx.fillStyle = `rgba(${RED[0]},${RED[1]},${RED[2]},${(1 - p) * 0.2})`;
            ctx.fillText(".", rx, ry);
          }
        }

        ctx.font = `${fontSize}px var(--font-mono, monospace)`;

        if (isHit) {
          const p = (t - n.hitTime) / 2;
          // Flash character to '!' during hit
          ctx.fillStyle = `rgba(${RED[0]},${RED[1]},${RED[2]},${0.5 + (1 - p) * 0.5})`;
          ctx.fillText("!", n.x, n.y);
        } else {
          ctx.fillStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${(0.2 + pulse * 0.15)})`;
          ctx.fillText(n.char, n.x, n.y);
        }
      }

      // Draw agents as colored ASCII characters
      for (const ag of agents) {
        ag.progress += ag.speed;
        if (ag.progress >= 1) {
          // Trigger hit on target node
          if (Math.random() < 0.25) {
            const hitNode = nodes[ag.to];
            hitNode.hitTime = t;

            // Spawn burst particles
            const burstCount = 4 + Math.floor(Math.random() * 4);
            for (let b = 0; b < burstCount; b++) {
              const angle = (b / burstCount) * Math.PI * 2 + Math.random() * 0.5;
              bursts.push({
                x: hitNode.x,
                y: hitNode.y,
                vx: Math.cos(angle) * (1 + Math.random() * 2),
                vy: Math.sin(angle) * (1 + Math.random() * 2),
                char: randomChar(),
                life: 1,
                color: RED,
              });
            }
          }
          const [from, to] = findEdge(nodes, MAX_DIST);
          ag.from = from;
          ag.to = to;
          ag.progress = 0;
        }

        const fn = nodes[ag.from];
        const tn = nodes[ag.to];
        const x = fn.x + (tn.x - fn.x) * ag.progress;
        const y = fn.y + (tn.y - fn.y) * ag.progress;
        const ac = AGENT_COLORS[ag.colorIdx];
        const agentChar = AGENT_CHAR_MAP[ac.key];

        // Glow
        const g = ctx.createRadialGradient(x, y, 0, x, y, 12);
        g.addColorStop(
          0,
          `rgba(${ac.rgb[0]},${ac.rgb[1]},${ac.rgb[2]},0.35)`
        );
        g.addColorStop(
          1,
          `rgba(${ac.rgb[0]},${ac.rgb[1]},${ac.rgb[2]},0)`
        );
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // Trail: fading characters behind the agent
        const trail = 0.15;
        ctx.font = "8px var(--font-mono, monospace)";
        for (let s = 1; s <= 3; s++) {
          const tp = Math.max(0, ag.progress - trail * s * 0.3);
          const tx = fn.x + (tn.x - fn.x) * tp;
          const ty = fn.y + (tn.y - fn.y) * tp;
          ctx.fillStyle = `rgba(${ac.rgb[0]},${ac.rgb[1]},${ac.rgb[2]},${0.3 - s * 0.08})`;
          ctx.fillText(".", tx, ty);
        }

        // Agent character (core)
        ctx.font = "bold 11px var(--font-mono, monospace)";
        ctx.fillStyle = `rgb(${ac.rgb[0]},${ac.rgb[1]},${ac.rgb[2]})`;
        ctx.fillText(agentChar, x, y);
      }

      // Update and draw burst particles
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.96;
        b.vy *= 0.96;
        b.life -= 0.03;
        if (b.life <= 0) {
          bursts.splice(i, 1);
          continue;
        }
        ctx.font = "9px var(--font-mono, monospace)";
        ctx.fillStyle = `rgba(${b.color[0]},${b.color[1]},${b.color[2]},${b.life * 0.6})`;
        ctx.fillText(b.char, b.x, b.y);
      }

      // Cap burst particles
      while (bursts.length > 60) bursts.shift();

      raf.current = requestAnimationFrame(draw);
    };

    draw();

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      mouse.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen pointer-events-none"
      style={{ opacity: 0.55, zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
