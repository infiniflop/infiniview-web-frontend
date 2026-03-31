"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  hitTime: number;
}

interface Agent {
  from: number;
  to: number;
  progress: number;
  speed: number;
  color: string;
}

const ACCENT = [224, 90, 56];
const RED = [239, 68, 68];
const TEAL = [20, 184, 166];
const CYAN = [6, 182, 212];

const AGENT_COLORS = [
  `rgb(${ACCENT})`,
  `rgb(${TEAL})`,
  `rgb(${CYAN})`,
  `rgb(${RED})`,
];

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

    const NODE_COUNT = 40;
    const MAX_DIST = Math.min(w, h) * 0.2;
    const AGENT_COUNT = 15;

    const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      size: 1.2 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
      hitTime: -10,
    }));

    const agents: Agent[] = Array.from({ length: AGENT_COUNT }, () => {
      const [from, to] = findEdge(nodes, MAX_DIST);
      return {
        from,
        to,
        progress: Math.random(),
        speed: 0.002 + Math.random() * 0.004,
        color: AGENT_COLORS[Math.floor(Math.random() * AGENT_COLORS.length)],
      };
    });

    let t = 0;

    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      // update nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.phase += 0.015;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        const dx = n.x - mouse.current.x;
        const dy = n.y - mouse.current.y;
        const md = Math.sqrt(dx * dx + dy * dy);
        if (md < 100 && md > 0) {
          const f = ((100 - md) / 100) * 0.4;
          n.x += (dx / md) * f;
          n.y += (dy / md) * f;
        }
      }

      // draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            const a = (1 - d / MAX_DIST) * 0.12;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${a})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // draw nodes
      for (const n of nodes) {
        const pulse = Math.sin(n.phase) * 0.3 + 0.7;
        const isHit = t - n.hitTime < 2;

        if (isHit) {
          const p = (t - n.hitTime) / 2;
          // expanding ring
          ctx.beginPath();
          ctx.arc(n.x, n.y, p * 35, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${RED[0]},${RED[1]},${RED[2]},${(1 - p) * 0.25})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          // red glow
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${RED[0]},${RED[1]},${RED[2]},${(1 - p) * 0.2})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = isHit
          ? `rgba(${RED[0]},${RED[1]},${RED[2]},0.7)`
          : `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${0.25 + pulse * 0.15})`;
        ctx.fill();
      }

      // draw agents
      for (const ag of agents) {
        ag.progress += ag.speed;
        if (ag.progress >= 1) {
          if (Math.random() < 0.25) nodes[ag.to].hitTime = t;
          const [from, to] = findEdge(nodes, MAX_DIST);
          ag.from = from;
          ag.to = to;
          ag.progress = 0;
        }

        const fn = nodes[ag.from];
        const tn = nodes[ag.to];
        const x = fn.x + (tn.x - fn.x) * ag.progress;
        const y = fn.y + (tn.y - fn.y) * ag.progress;

        // glow
        const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
        g.addColorStop(0, ag.color.replace("rgb", "rgba").replace(")", ",0.4)"));
        g.addColorStop(1, ag.color.replace("rgb", "rgba").replace(")", ",0)"));
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // trail
        const trail = 0.15;
        for (let s = 1; s <= 3; s++) {
          const tp = Math.max(0, ag.progress - trail * s * 0.3);
          const tx = fn.x + (tn.x - fn.x) * tp;
          const ty = fn.y + (tn.y - fn.y) * tp;
          ctx.beginPath();
          ctx.arc(tx, ty, 1.5 - s * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = ag.color
            .replace("rgb", "rgba")
            .replace(")", `,${0.3 - s * 0.08})`);
          ctx.fill();
        }

        // core
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = ag.color;
        ctx.fill();
      }

      raf.current = requestAnimationFrame(draw);
    };

    draw();

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => {
      mouse.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.55 }}
    />
  );
}
