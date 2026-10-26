"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/site/gsap";
import { setMood } from "@/lib/site/scene";
import { ARSENAL } from "@/lib/site/content";
import { Counter } from "@/components/site/counter";

/* The four layers, drawn so each one literally contains its count. */

function ReviewPattern() {
  const widths = [78, 52, 90, 40, 66, 84, 48, 60];
  return (
    <svg viewBox="0 0 300 300" className="plane-art" aria-hidden>
      {widths.map((w, i) => (
        <rect key={i} x={40 + (i % 3 === 1 ? 18 : 0)} y={46 + i * 26} width={w * 1.9} height="9" rx="4.5" fill="currentColor" opacity={0.18 + (i % 3) * 0.06} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <g key={i} className="agent-dot" style={{ animationDelay: `${i * 0.5}s` }}>
          <circle cx={[236, 210, 252, 190][i]} cy={[63, 115, 167, 219][i]} r="8" fill="var(--iv-lime)" />
          <circle cx={[236, 210, 252, 190][i]} cy={[63, 115, 167, 219][i]} r="15" stroke="var(--iv-lime)" strokeOpacity="0.4" />
        </g>
      ))}
    </svg>
  );
}

function StaticPattern() {
  const rows = [7, 7, 6, 6];
  let n = 0;
  return (
    <svg viewBox="0 0 300 300" className="plane-art" aria-hidden>
      {rows.map((count, r) =>
        Array.from({ length: count }).map((_, c) => {
          const idx = n++;
          const x = 150 - (count * 30) / 2 + c * 30 + 3;
          return (
            <rect key={idx} className="cell" style={{ animationDelay: `${(idx % 9) * 0.18}s` }} x={x} y={70 + r * 40} width="24" height="28" rx="7" fill="currentColor" />
          );
        }),
      )}
    </svg>
  );
}

function RuntimePattern() {
  return (
    <svg viewBox="0 0 300 300" className="plane-art" aria-hidden>
      <circle cx="150" cy="150" r="44" stroke="var(--iv-red)" strokeOpacity="0.7" strokeWidth="2" fill="rgba(255,90,71,0.08)" />
      <circle cx="150" cy="150" r="18" fill="var(--iv-red)" opacity="0.8" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        // rounded: Node and the browser disagree in the last float digits, which breaks hydration
        const r2 = (v: number) => Math.round(v * 100) / 100;
        const x1 = r2(150 + Math.cos(a) * 126);
        const y1 = r2(150 + Math.sin(a) * 126);
        const x2 = r2(150 + Math.cos(a) * 62);
        const y2 = r2(150 + Math.sin(a) * 62);
        return (
          <g key={i} className="spoke" style={{ animationDelay: `${(i % 6) * 0.22}s` }}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--iv-red)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={x1} cy={y1} r="5" fill="var(--iv-red)" />
          </g>
        );
      })}
    </svg>
  );
}

function InteractionPattern() {
  const pts = [
    [70, 80], [130, 70], [200, 96], [232, 150], [180, 190], [110, 214], [66, 160],
  ];
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  return (
    <svg viewBox="0 0 300 300" className="plane-art" aria-hidden>
      <rect x="44" y="52" width="212" height="196" rx="22" fill="rgba(255,255,255,0.04)" stroke="currentColor" strokeOpacity="0.25" />
      <rect x="64" y="72" width="90" height="10" rx="5" fill="currentColor" opacity="0.2" />
      <path d={d} className="trace" stroke="var(--iv-lime)" strokeWidth="2.2" strokeDasharray="4 7" strokeLinecap="round" fill="none" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="7" fill="#070a14" stroke="var(--iv-lime)" strokeWidth="2.2" />
      ))}
    </svg>
  );
}

const PATTERNS = [ReviewPattern, StaticPattern, RuntimePattern, InteractionPattern];

export function Arsenal() {
  const root = useRef<HTMLElement>(null);
  const stack = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(2);
  const [auto, setAuto] = useState(true);
  const [inView, setInView] = useState(false);
  const [hover, setHover] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const planes = gsap.utils.toArray<HTMLElement>(".plane", root.current!);
        const st = stack.current!;
        gsap.set(st, { rotationX: 58, rotationZ: -36, transformPerspective: 2000 });
        // the layers pull apart as you arrive, then hold
        gsap.fromTo(
          planes,
          { z: 0 },
          {
            z: (i) => (planes.length - 1 - i) * 70,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 75%", end: "top 15%", scrub: 0.6 },
          },
        );
        gsap.fromTo(
          st,
          { rotationX: 44, rotationZ: -54, y: 40 },
          {
            rotationX: 58,
            rotationZ: -36,
            y: 0,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 80%", end: "bottom 30%", scrub: 0.8 },
          },
        );
        ScrollTrigger.create({
          trigger: root.current,
          start: "top 55%",
          end: "bottom 45%",
          onToggle: (self) => {
            setInView(self.isActive);
            if (self.isActive) setMood({ alert: 0.45, energy: 0.7, portal: 0.5 }, 1.4);
          },
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        const planes = gsap.utils.toArray<HTMLElement>(".plane", root.current!);
        gsap.set(planes, { z: (i: number) => (planes.length - 1 - i) * 70 });
        gsap.set(stack.current, { rotationX: 58, rotationZ: -36, transformPerspective: 2000 });
        setAuto(false);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // idle autoplay through the layers
  useEffect(() => {
    if (!auto || !inView || hover || prefersReducedMotion()) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % ARSENAL.length), 4200);
    return () => window.clearTimeout(id);
  }, [auto, inView, hover, active]);

  const choose = (i: number) => {
    setAuto(false);
    setActive(i);
  };

  return (
    <section ref={root} id="arsenal" className="arsenal" aria-labelledby="arsenal-title">
      <div className="wrap">
        <div className="arsenal-head">
          <h2 id="arsenal-title" className="t-h2" data-split>
            Every layer, covered.
          </h2>
          <p className="t-lede arsenal-lede" data-reveal>
            Static analysis, runtime attacks, interaction testing, and AI code review, combined into one scan.
          </p>
        </div>

        <div className="arsenal-grid">
          {/* An always-one-open accordion: heading + button[aria-expanded] + a sibling region.
              (A tabpanel inside a tab button is invalid ARIA.) */}
          <div className="arsenal-list">
            {ARSENAL.map((a, i) => (
              <div
                key={a.id}
                className="layer-row"
                data-on={i === active}
                data-reveal
                onPointerEnter={() => setHover(true)}
                onPointerMove={(e) => {
                  // only when the pointer actually moves: opening a layer reflows the list, and the row that
                  // slides under a parked pointer must not then open as well (a cascade)
                  if (i !== active && (e.movementX || e.movementY)) setActive(i);
                }}
                onPointerLeave={() => setHover(false)}
              >
                <h3 className="layer-head">
                  <button
                    type="button"
                    id={`layer-${a.id}`}
                    aria-expanded={i === active}
                    aria-controls={`layer-panel-${a.id}`}
                    className="layer-tab"
                    onClick={() => choose(i)}
                    onFocus={() => choose(i)}
                  >
                    <span className="layer-num">
                      <Counter value={a.count} />
                    </span>
                    <span className="layer-meta">
                      <span className="layer-name">{a.unit}</span>
                      <span className="layer-sub">{a.sub}</span>
                    </span>
                  </button>
                </h3>
                <div
                  id={`layer-panel-${a.id}`}
                  className="layer-body"
                >
                  <span>
                    <b className="layer-title">{a.title}</b>
                    <span className="layer-text">{a.body}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="stack-col" aria-hidden>
            <div className="stack-stage">
              <div className="stack-fit">
              <div ref={stack} className="stack">
                {ARSENAL.map((a, i) => {
                  const Pattern = PATTERNS[i];
                  return (
                    <div
                      key={a.id}
                      className="plane"
                      data-on={i === active}
                      style={{ ["--lift" as string]: i < active ? "210px" : i === active ? "28px" : "0px" }}
                      onPointerEnter={() => setHover(true)}
                      onPointerMove={(e) => {
                        if (i !== active && (e.movementX || e.movementY)) setActive(i);
                      }}
                      onPointerLeave={() => setHover(false)}
                    >
                      <div className="plane-face">
                        <Pattern />
                      </div>
                    </div>
                  );
                })}
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
