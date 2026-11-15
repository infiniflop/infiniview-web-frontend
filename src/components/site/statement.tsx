"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/site/gsap";
import { setMood } from "@/lib/site/scene";
import { STATEMENT, TRUST_STATS, TRUST_NOTE } from "@/lib/site/content";

/**
 * A quiet beat: the argument in one sentence, read out by the scroll. Each word lights as you pass
 * it. Then four numbers, set large and left alone: they are facts, so they are never counted up
 * from a wrong value.
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
          // aria "none": the words stay real text for assistive tech (an aria-label is not allowed on a <p>).
          // The unlit level is deliberately readable (contrast ≥ 3:1 for large text): it is "not yet read",
          // not hidden.
          split = SplitText.create(el, { type: "words", aria: "none" });
          gsap.set(split.words, { opacity: 0.4 });
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current!.querySelector(".statement-pin"),
              start: "top top",
              end: "+=80%",
              pin: true,
              scrub: 0.5,
              anticipatePin: 1,
              refreshPriority: 1,
            },
          });
          tl.to(split.words, { opacity: 1, stagger: 0.12, ease: "none", duration: 1 });
          st = tl.scrollTrigger;
        };
        if (document.fonts?.status === "loaded") build();
        else document.fonts?.ready.then(build);

        // the light drops behind the sentence and warms toward proof as it is read
        const mood = ScrollTrigger.create({
          trigger: root.current,
          start: "top 70%",
          end: "bottom 40%",
          onEnter: () => setMood({ x: 0.9, y: 0.12, spread: 0.24, energy: 0.5, alert: 0, proof: 0.6 }),
          onEnterBack: () => setMood({ x: 0.9, y: 0.12, spread: 0.24, energy: 0.5, alert: 0, proof: 0.6 }),
          onLeaveBack: () => setMood({ x: 0.84, y: 0.34, spread: 0.24, energy: 0.62, alert: 0, proof: 0 }),
        });

        return () => {
          cancelled = true;
          mood.kill();
          st?.kill();
          split?.revert();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="statement" aria-labelledby="statement-text">
      <div className="statement-pin">
        <div className="wrap">
          <p id="statement-text" ref={sentence} className="t-display statement-text">
            {STATEMENT.lead} <span className="t-lime">{STATEMENT.accent}</span>
          </p>
        </div>
      </div>

      <div className="wrap">
        <ul className="stats">
          {TRUST_STATS.map((s) => (
            <li key={s.label} className="stat" data-reveal>
              <span className="stat-num">
                {s.value}
                {s.suffix}
              </span>
              <span className="stat-label">{s.label}</span>
            </li>
          ))}
        </ul>
        <p className="stats-note t-small" data-reveal="fade">
          {TRUST_NOTE}
        </p>
      </div>
    </section>
  );
}
