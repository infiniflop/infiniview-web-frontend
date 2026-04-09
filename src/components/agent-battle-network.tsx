"use client";

import { useEffect, useRef } from "react";

/* ── colour palette ── */
const ACCENT = [224, 90, 56];
const RED = [239, 68, 68];
const TEAL = [20, 184, 166];
const CYAN = [6, 182, 212];
const PURPLE = [168, 85, 247];

const AGENT_COLORS = [
  `rgb(${ACCENT})`,
  `rgb(${TEAL})`,
  `rgb(${CYAN})`,
  `rgb(${RED})`,
];

const ORBITAL_COLORS = [
  [212, 175, 55],   // gold
  [255, 215, 0],    // bright gold
  [230, 190, 138],  // champagne gold
  [192, 192, 192],  // silver
  [220, 220, 230],  // platinum
  [183, 135, 38],   // antique gold
  [30, 30, 30],     // onyx black
  [50, 50, 50],     // gunmetal
  [207, 181, 59],   // 24k gold
  [170, 169, 173],  // brushed steel
  [218, 165, 32],   // goldenrod
  [229, 228, 226],  // pearl white
  [181, 166, 66],   // old gold
  [196, 202, 206],  // chrome
];

/* ── types ── */
interface OrbitalNode {
  angle: number;
  speed: number;
  orbitRx: number;
  orbitRy: number;
  size: number;
  color: number[];
  offsetX: number;
  offsetY: number;
  phase: number;
}

interface BattleNode {
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

function findEdge(nodes: BattleNode[], maxDist: number): [number, number] {
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
  const scrollY = useRef(0);
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

    /* ── orbital: single rigid structure, rotates as one unit ── */
    const ORBITAL_COUNT = 18;
    const orbitalNodes: OrbitalNode[] = Array.from({ length: ORBITAL_COUNT }, (_, i) => {
      const ring = Math.floor(i / 6);
      const indexInRing = i % 6;
      const baseRadius = 250 + ring * 200;
      return {
        angle: (indexInRing / 6) * Math.PI * 2 + ring * 0.4,
        speed: 0,
        orbitRx: baseRadius,
        orbitRy: baseRadius * 0.55,
        size: 14 + Math.random() * 14,
        color: ORBITAL_COLORS[i % ORBITAL_COLORS.length],
        offsetX: 0,
        offsetY: 0,
        phase: Math.random() * Math.PI * 2,
      };
    });
    let globalRotation = 0;

    /* ── battle nodes ── */
    const NODE_COUNT = 120;
    const AGENT_COUNT = 30;
    const battleNodes: BattleNode[] = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      size: 1.2 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
      hitTime: -10,
    }));

    const MAX_DIST = Math.min(w, h) * 0.18;
    const agents: Agent[] = Array.from({ length: AGENT_COUNT }, () => {
      const [from, to] = findEdge(battleNodes, MAX_DIST);
      return {
        from,
        to,
        progress: Math.random(),
        speed: 0.002 + Math.random() * 0.004,
        color: AGENT_COLORS[Math.floor(Math.random() * AGENT_COLORS.length)],
      };
    });

    let t = 0;

    /* ── draw orbital: big filled circles with dotted connections ── */
    function drawOrbital(alpha: number) {
      if (!ctx) return;
      const cx = w / 2;
      const cy = h * 0.45;

      // rotate entire structure as one unit
      globalRotation += 0.0006;

      const positions: { x: number; y: number; node: OrbitalNode }[] = [];
      for (const node of orbitalNodes) {
        node.phase += 0.01;
        const a = node.angle + globalRotation;
        const x = cx + Math.cos(a) * node.orbitRx;
        const y = cy + Math.sin(a) * node.orbitRy;
        positions.push({ x, y, node });
      }

      // dotted connections between nearby orbs
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const dx = positions[i].x - positions[j].x;
          const dy = positions[i].y - positions[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 400) {
            const lineAlpha = (1 - d / 400) * 0.35 * alpha;
            ctx.beginPath();
            ctx.setLineDash([4, 6]);
            ctx.moveTo(positions[i].x, positions[i].y);
            ctx.lineTo(positions[j].x, positions[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${lineAlpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }

      // draw ultra-shiny metallic orbs
      for (const { x, y, node } of positions) {
        const pulse = Math.sin(node.phase) * 0.1 + 0.9;
        const [r, g, b] = node.color;
        const s = node.size * pulse;

        // outer glow (warm tint)
        const glow = ctx.createRadialGradient(x, y, s * 0.5, x, y, s * 3);
        glow.addColorStop(0, `rgba(${r},${g},${b},${0.15 * alpha})`);
        glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(x, y, s * 3, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // base sphere gradient (dark edge to mid tone)
        const base = ctx.createRadialGradient(x, y + s * 0.15, s * 0.1, x, y, s);
        base.addColorStop(0, `rgba(${Math.min(255, r + 40)},${Math.min(255, g + 40)},${Math.min(255, b + 40)},${0.85 * alpha})`);
        base.addColorStop(0.7, `rgba(${r},${g},${b},${0.75 * alpha})`);
        base.addColorStop(1, `rgba(${Math.max(0, r - 60)},${Math.max(0, g - 60)},${Math.max(0, b - 60)},${0.6 * alpha})`);
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fillStyle = base;
        ctx.fill();

        // specular highlight (bright white spot, top-left)
        const spec = ctx.createRadialGradient(x - s * 0.3, y - s * 0.35, 0, x - s * 0.3, y - s * 0.35, s * 0.55);
        spec.addColorStop(0, `rgba(255,255,255,${0.85 * alpha})`);
        spec.addColorStop(0.3, `rgba(255,255,255,${0.35 * alpha})`);
        spec.addColorStop(1, `rgba(255,255,255,0)`);
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fillStyle = spec;
        ctx.fill();

        // rim light (subtle bright edge at bottom)
        const rim = ctx.createRadialGradient(x, y + s * 0.6, 0, x, y + s * 0.6, s * 0.5);
        rim.addColorStop(0, `rgba(255,255,255,${0.12 * alpha})`);
        rim.addColorStop(1, `rgba(255,255,255,0)`);
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fillStyle = rim;
        ctx.fill();
      }
    }

    /* ── draw battle state ── */
    function drawBattle(alpha: number) {
      if (!ctx) return;
      for (const n of battleNodes) {
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

      for (let i = 0; i < battleNodes.length; i++) {
        for (let j = i + 1; j < battleNodes.length; j++) {
          const dx = battleNodes[i].x - battleNodes[j].x;
          const dy = battleNodes[i].y - battleNodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            const a = (1 - d / MAX_DIST) * 0.12 * alpha;
            ctx.beginPath();
            ctx.moveTo(battleNodes[i].x, battleNodes[i].y);
            ctx.lineTo(battleNodes[j].x, battleNodes[j].y);
            ctx.strokeStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${a})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      for (const n of battleNodes) {
        const pulse = Math.sin(n.phase) * 0.3 + 0.7;
        const isHit = t - n.hitTime < 2;

        if (isHit) {
          const p = (t - n.hitTime) / 2;
          ctx.beginPath();
          ctx.arc(n.x, n.y, p * 35, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${RED[0]},${RED[1]},${RED[2]},${(1 - p) * 0.25 * alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${RED[0]},${RED[1]},${RED[2]},${(1 - p) * 0.2 * alpha})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = isHit
          ? `rgba(${RED[0]},${RED[1]},${RED[2]},${0.7 * alpha})`
          : `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${(0.25 + pulse * 0.15) * alpha})`;
        ctx.fill();
      }

      for (const ag of agents) {
        ag.progress += ag.speed;
        if (ag.progress >= 1) {
          if (Math.random() < 0.25) battleNodes[ag.to].hitTime = t;
          const [from, to] = findEdge(battleNodes, MAX_DIST);
          ag.from = from;
          ag.to = to;
          ag.progress = 0;
        }

        const fn = battleNodes[ag.from];
        const tn = battleNodes[ag.to];
        const x = fn.x + (tn.x - fn.x) * ag.progress;
        const y = fn.y + (tn.y - fn.y) * ag.progress;

        const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
        g.addColorStop(0, ag.color.replace("rgb", "rgba").replace(")", `,${0.4 * alpha})`));
        g.addColorStop(1, ag.color.replace("rgb", "rgba").replace(")", ",0)"));
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        const trail = 0.15;
        for (let s = 1; s <= 3; s++) {
          const tp = Math.max(0, ag.progress - trail * s * 0.3);
          const tx = fn.x + (tn.x - fn.x) * tp;
          const ty = fn.y + (tn.y - fn.y) * tp;
          ctx.beginPath();
          ctx.arc(tx, ty, 1.5 - s * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = ag.color
            .replace("rgb", "rgba")
            .replace(")", `,${(0.3 - s * 0.08) * alpha})`);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = ag.color.replace("rgb", "rgba").replace(")", `,${alpha})`);
        ctx.fill();
      }
    }

    /* ── main loop ── */
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      const transition = Math.min(1, Math.max(0, scrollY.current / (h * 0.8)));
      const orbitalAlpha = 1 - transition;
      const battleAlpha = transition;

      if (orbitalAlpha > 0.01) drawOrbital(orbitalAlpha);
      if (battleAlpha > 0.01) drawBattle(battleAlpha);

      raf.current = requestAnimationFrame(draw);
    };

    draw();

    const onScroll = () => { scrollY.current = window.scrollY; };
    const onMove = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => { mouse.current = { x: -1000, y: -1000 }; };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen pointer-events-none"
      style={{ opacity: 0.3, zIndex: 0 }}
    />
  );
}
