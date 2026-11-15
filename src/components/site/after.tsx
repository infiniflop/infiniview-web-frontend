"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/site/gsap";
import { DOCS_URL, FEATURES, ZERO_CONFIG } from "@/lib/site/content";

const LINES = [
  { cmd: true, text: "connect github.com/acme/web-app" },
  { text: "attack surface discovered" },
  { text: "test plan generated" },
  { text: "scan started" },
] as const;

const LEDGER = [FEATURES.sandboxes, FEATURES.paths, FEATURES.learning, FEATURES.compliance];

/**
 * What it takes to start (nothing), shown as the four lines a first connection produces, and the
 * four things that are true of every scan, set as a plain ledger. A quiet beat between two loud ones.
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
            tl.fromTo(line, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4, ease: "expo.out" }, 0.9 + i * 0.32);
          }
        });
        const st = ScrollTrigger.create({ trigger: term, start: "top 78%", once: true, onEnter: () => tl.play() });
        return () => {
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
              <a href={DOCS_URL} className="btn btn--line">
                Read the docs
                <ArrowRight className="arrow" size={16} strokeWidth={2.6} />
              </a>
            </div>
          </div>

          <div className="term pane" role="img" aria-label="Sample run: a repository is connected, its attack surface is discovered, a test plan is generated and the scan starts." data-reveal>
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

        <ul className="ledger">
          {LEDGER.map((f, i) => (
            <li key={f.title} className="ledger-item" data-reveal>
              <span className="t-label" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="t-h3">{f.title}</h3>
              <p className="t-body">{f.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
