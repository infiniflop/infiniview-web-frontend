"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/site/gsap";
import { setMood } from "@/lib/site/scene";
import { STATEMENT, TRUST_STATS, TRUST_NOTE } from "@/lib/site/content";
import { Counter } from "@/components/site/counter";

/**
 * The argument in one sentence, read out by the scroll: each word lights as you
 * travel through it, then four plates of proof arrive from the depth.
 */
export function Statement() {
  const root = useRef<HTMLElement>(null);
  const sentence = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const el = sentence.current;
        if (!el) return;
        let split: SplitText | null = null;
        let st: ScrollTrigger | undefined;
        let cancelled = false;

        const build = () => {
          if (cancelled) return;
          split = SplitText.create(el, { type: "words", aria: "auto" });
          gsap.set(split.words, { opacity: 0.14 });
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current!.querySelector(".statement-pin"),
              start: "top top",
              end: "+=85%",
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
              refreshPriority: 1,
              onUpdate: (self) => setMood({ portal: 0.55 + self.progress * 0.5 }, 0.6),
            },
          });
          tl.to(split.words, { opacity: 1, stagger: 0.12, ease: "none", duration: 1 });
          st = tl.scrollTrigger;
        };
        if (document.fonts?.status === "loaded") build();
        else document.fonts?.ready.then(build);

        return () => {
          cancelled = true;
          st?.kill();
          split?.revert();
        };
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="statement" aria-labelledby="statement-text">
      <div className="statement-pin">
        <div className="wrap">
          <p id="statement-text" ref={sentence} className="t-h2 statement-text">
            {STATEMENT.lead} <span className="t-lime">{STATEMENT.accent}</span>
          </p>
        </div>
      </div>

      <div className="wrap">
        <ul className="plates">
          {TRUST_STATS.map((s) => (
            <li key={s.label} className="plate glass" data-reveal="scale">
              <span className="plate-num t-display">
                <Counter value={s.value} suffix={s.suffix} />
              </span>
              <span className="plate-label">{s.label}</span>
            </li>
          ))}
        </ul>
        <p className="plates-note t-small" data-reveal="fade">
          {TRUST_NOTE}
        </p>
      </div>
    </section>
  );
}
