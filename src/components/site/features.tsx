"use client";

import { useRef } from "react";
import { Check } from "lucide-react";
import { ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/site/gsap";
import { FEATURES, ZERO_CONFIG } from "@/lib/site/content";

const FAN = [
  { x: -214, y: 26, r: -15, label: "Screenshot" },
  { x: -108, y: 6, r: -7.5, label: "HTTP trace" },
  { x: 0, y: 0, r: 0, label: "Console log" },
  { x: 108, y: 6, r: 7.5, label: "Code path" },
  { x: 214, y: 26, r: 15, label: "Fix suggestion" },
];

function EvidenceFan() {
  return (
    <div className="fan" aria-hidden>
      {FAN.map((c, i) => (
        <div
          key={c.label}
          className="ecard"
          style={{ ["--x" as string]: `${c.x}px`, ["--y" as string]: `${c.y}px`, ["--r" as string]: `${c.r}deg`, zIndex: i === 2 ? 5 : 4 - Math.abs(i - 2) }}
        >
          <div className="ecard-body">
            {i === 0 && (
              <div className="e-shot">
                <span /><span /><span />
                <div className="e-shot-hit" />
              </div>
            )}
            {i === 1 && (
              <div className="e-mono">
                <p><b>POST</b> /v1/refund</p>
                <p>200 OK</p>
                <p>200 OK</p>
                <p>200 OK</p>
              </div>
            )}
            {i === 2 && (
              <div className="e-mono">
                <p className="dim">replay ×5</p>
                <p>5 refunds issued</p>
                <p className="red">no 409 returned</p>
              </div>
            )}
            {i === 3 && (
              <div className="e-path">
                <p>routes/refund.ts</p>
                <p>services/refund/handler.ts</p>
                <p className="hot">services/refund/ledger.ts</p>
              </div>
            )}
            {i === 4 && (
              <div className="e-diff">
                <s className="del" />
                <s className="add" />
                <s className="add" />
                <s />
              </div>
            )}
          </div>
          <span className={`ecard-label${i < 2 ? " is-l" : i > 2 ? " is-r" : ""}`}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

function SandboxFrames() {
  return (
    <div className="sbx" aria-hidden>
      <i className="sbx-f sbx-f1" />
      <i className="sbx-f sbx-f2" />
      <i className="sbx-f sbx-f3" />
      <i className="sbx-core" />
      <span className="sbx-tag">Deleted after every scan</span>
    </div>
  );
}

function AttackPath() {
  return (
    <svg className="apath" viewBox="0 0 440 150" fill="none" aria-hidden>
      {/* isolated, single-point findings */}
      <circle cx="40" cy="116" r="7" className="decoy" />
      <circle cx="190" cy="124" r="7" className="decoy" />
      <circle cx="330" cy="22" r="7" className="decoy" />
      {/* the chain */}
      <path className="chain" d="M 40 52 C 90 52, 100 86, 150 80 S 250 40, 290 70 S 360 100, 402 70" />
      <path className="chain chain--run" d="M 40 52 C 90 52, 100 86, 150 80 S 250 40, 290 70 S 360 100, 402 70" />
      {[[40, 52, "Entry"], [150, 80, "Weak auth"], [290, 70, "Pivot"], [402, 70, "Data"]].map(([x, y, t]) => (
        <g key={t as string}>
          <circle cx={x as number} cy={y as number} r="9" className="node" />
          <text x={x as number} y={(y as number) - 18} textAnchor="middle" className="node-t">{t as string}</text>
        </g>
      ))}
    </svg>
  );
}

function Learning() {
  // a 7×7 field; the ring/centre dots that spell the mark resolve out of the noise
  const cells: { x: number; y: number; on: 0 | 1 | 2 }[] = [];
  for (let r = 0; r < 7; r++)
    for (let c = 0; c < 7; c++) {
      const ring = Math.max(Math.abs(r - 3), Math.abs(c - 3));
      const on = ring === 3 ? 2 : ring === 1 ? 1 : 0;
      cells.push({ x: 20 + c * 30, y: 20 + r * 30, on: ring === 2 ? 0 : (on as 0 | 1 | 2) });
    }
  return (
    <svg className="learn" viewBox="0 0 220 220" aria-hidden>
      {cells.map((d, i) => (
        <circle
          key={i}
          cx={d.x}
          cy={d.y}
          r={d.on ? 4.6 : 3}
          className={d.on ? "dot dot--sig" : "dot dot--noise"}
          style={{ animationDelay: `${(i % 11) * 0.14}s` }}
        />
      ))}
    </svg>
  );
}

function Report() {
  return (
    <div className="doc" aria-hidden>
      <div className="doc-head">
        <b>Security compliance report</b>
      </div>
      <ul>
        {["SOC 2", "ISO 27001", "Internal audit"].map((x) => (
          <li key={x}>
            <Check size={14} strokeWidth={3} />
            {x}
            <i />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Terminal() {
  return (
    <div className="zterm t-mono" aria-hidden>
      <p style={{ ["--d" as string]: "0s" }}><span className="p">›</span> connect github.com/acme/web-app</p>
      <p style={{ ["--d" as string]: "0.9s" }}><Check size={13} strokeWidth={3} /> attack surface discovered</p>
      <p style={{ ["--d" as string]: "1.8s" }}><Check size={13} strokeWidth={3} /> test plan generated</p>
      <p style={{ ["--d" as string]: "2.7s" }}><Check size={13} strokeWidth={3} /> scan started</p>
    </div>
  );
}

export function Features() {
  const root = useRef<HTMLElement>(null);

  // loops only run while the bento is on screen, and never under reduced motion
  // (the stylesheet shows each tile's finished static state instead)
  useGSAP(
    () => {
      const el = root.current?.querySelector(".bento");
      if (!el || prefersReducedMotion()) return;
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        end: "bottom 10%",
        onToggle: (self) => el.classList.toggle("is-live", self.isActive),
      });
      return () => st.kill();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="why" className="why" aria-labelledby="why-title">
      <div className="wrap">
        <h2 id="why-title" className="t-h2 why-title" data-split>
          Built around proof.
        </h2>

        <div className="bento">
          <article className="tile glass b-hero" data-reveal>
            <div className="tile-copy">
              <h3 className="t-h3">{FEATURES.hero.title}</h3>
              <p className="t-body">{FEATURES.hero.body}</p>
            </div>
            <EvidenceFan />
          </article>

          <article className="tile glass b-sand" data-reveal>
            <div className="tile-copy">
              <h3 className="t-h3">{FEATURES.sandboxes.title}</h3>
              <p className="t-body">{FEATURES.sandboxes.body}</p>
            </div>
            <SandboxFrames />
          </article>

          <article className="tile glass b-path" data-reveal>
            <div className="tile-copy">
              <h3 className="t-h3">{FEATURES.paths.title}</h3>
              <p className="t-body">{FEATURES.paths.body}</p>
            </div>
            <AttackPath />
          </article>

          <article className="tile glass b-learn" data-reveal>
            <Learning />
            <div className="tile-copy">
              <h3 className="t-h3">{FEATURES.learning.title}</h3>
              <p className="t-body">{FEATURES.learning.body}</p>
            </div>
          </article>

          <article className="tile glass b-comp" data-reveal>
            <Report />
            <div className="tile-copy">
              <h3 className="t-h3">{FEATURES.compliance.title}</h3>
              <p className="t-body">{FEATURES.compliance.body}</p>
            </div>
          </article>

          <article className="tile glass glass--lime b-zero" data-reveal>
            <Terminal />
            <div className="tile-copy">
              <h3 className="t-h3">{ZERO_CONFIG.title}</h3>
              <p className="t-body">{ZERO_CONFIG.body}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
