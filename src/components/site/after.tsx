"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/site/gsap";
import { DOCS_URL, ZERO_CONFIG } from "@/lib/site/content";
import { aimLight, setMood } from "@/lib/site/scene";
import { tap } from "@/lib/site/haptics";

// What a first connection produces, and what is true of every scan after it: the site's four
// standing claims (sandboxes deleted, attack paths chained, noise learned down, compliance reports)
// as lines of a sample run, not as a row of feature cards.
const LINES = [
  { cmd: true, text: "connect github.com/acme/web-app" },
  { text: "attack surface discovered" },
  { text: "test plan generated" },
  { text: "scan started" },
  { text: "multi-step attack paths chained" },
  { text: "noise reduced from learned codebase patterns" },
  { text: "compliance report: SOC 2, ISO 27001" },
  { text: "sandbox deleted" },
] as const;

/**
 * What it takes to start (nothing), shown as the log of a sample run: one typed command, then what
 * follows without anyone doing anything. A quiet beat between two loud ones.
 */
export function After() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const term = root.current!.querySelector(".term");
        const lines = gsap.utils.toArray<HTMLElement>(".term-line", root.current!);
        gsap.set(lines, { opacity: 0 });
        const tl = gsap.timeline({ paused: true });
        lines.forEach((line, i) => {
          const text = line.querySelector(".term-text");
          // the command is typed (a constant rate: it is a hand on a keyboard); the replies arrive
          if (i === 0) {
            tl.set(line, { opacity: 1 }, 0).fromTo(text, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "steps(31)" }, 0.1);
          } else {
            tl.fromTo(line, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4, ease: "expo.out" }, 0.9 + i * 0.26);
          }
        });
        const st = ScrollTrigger.create({ trigger: term, start: "top 78%", once: true, onEnter: () => tl.play() });
        const light = () => {
          aimLight(term as HTMLElement, 0.5, 0.5);
          setMood({ spread: 0.22, energy: 0.6, alert: 0, proof: 0.5 });
        };
        const mood = ScrollTrigger.create({ trigger: root.current, start: "top 60%", end: "bottom 40%", onEnter: light, onEnterBack: light });
        return () => {
          mood.kill();
          st.kill();
          tl.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="after" aria-labelledby="after-title">
      <div className="wrap">
        <div className="after-grid">
          <div className="after-copy">
            <h2 id="after-title" className="t-h2" data-split>
              {ZERO_CONFIG.title}
            </h2>
            <p className="t-lede" data-reveal>
              {ZERO_CONFIG.body}
            </p>
            <div data-reveal>
              <a href={DOCS_URL} className="btn btn--line" {...tap("light")}>
                Read the docs
                <ArrowRight className="arrow" size={16} strokeWidth={2.6} />
              </a>
            </div>
          </div>

          <div className="term pane" role="img" aria-label="Sample run: a repository is connected; its attack surface is discovered, a test plan is generated and the scan starts; multi-step attack paths are chained, noise is reduced from learned codebase patterns, a compliance report for SOC 2 and ISO 27001 is produced, and the sandbox is deleted." data-reveal>
            <div className="term-bar" aria-hidden>
              <span className="app-dots">
                <i />
                <i />
                <i />
              </span>
              <span className="t-label">infiniview</span>
              <span className="app-tag">Sample</span>
            </div>
            <div className="term-body" aria-hidden>
              {LINES.map((l) => (
                <p key={l.text} className="term-line" data-cmd={"cmd" in l ? "true" : undefined}>
                  <span className="term-mark">{"cmd" in l ? "›" : "✓"}</span>
                  <span className="term-text">{l.text}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
