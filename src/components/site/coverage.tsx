"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/site/gsap";
import { aimLight, QUIET, setMood } from "@/lib/site/scene";
import { ARSENAL, LAYER_ITEMS, SCANNER_FAMILIES } from "@/lib/site/content";

/**
 * "Every layer, covered": the four layers of a scan, each with its number and, next to the number,
 * the things it counts. The 26 scanners are listed by name (from the product docs) so the claim can
 * be checked by reading it. No illustration: the names are the picture.
 */
export function Coverage() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rows = gsap.utils.toArray<HTMLElement>(".cov-row", root.current!);
        const triggers = rows.map((row) => {
          const num = row.querySelector(".cov-num > span");
          const line = row.querySelector(".cov-line");
          const chips = row.querySelectorAll(".cov-chip");
          const tl = gsap.timeline({ paused: true });
          // the numeral rises out of its mask already correct; its lane's line draws across; then the names
          tl.fromTo(num, { yPercent: 115 }, { yPercent: 0, duration: 0.9, ease: "expo.out" }, 0)
            .fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "expo.out" }, 0.05)
            .fromTo(row.querySelectorAll(".cov-copy > *"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: "expo.out", stagger: 0.05 }, 0.12)
            .fromTo(chips, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out", stagger: { each: 0.018, from: "start" } }, 0.22);
          return ScrollTrigger.create({ trigger: row, start: "top 86%", once: true, onEnter: () => tl.play() });
        });
        const quiet = () => {
          aimLight(null);
          setMood(QUIET);
        };
        const mood = ScrollTrigger.create({
          trigger: root.current,
          start: "top 60%",
          end: "bottom 40%",
          onEnter: quiet,
          onEnterBack: quiet,
        });
        return () => {
          mood.kill();
          triggers.forEach((t) => t.kill());
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="coverage" className="cov" aria-labelledby="cov-title">
      {/* the old address of this section (/#arsenal) still lands here */}
      <span id="arsenal" className="cov-alias" aria-hidden />
      <div className="wrap">
        <div className="sec-head">
          <h2 id="cov-title" className="t-h2" data-split>
            Every layer, covered.
          </h2>
          <p className="t-lede" data-reveal>
            Static analysis, runtime attacks, interaction testing, and AI code review, combined into one scan.
          </p>
        </div>

        <ul className="cov-list">
          {ARSENAL.map((layer) => (
            <li key={layer.id} className="cov-row" style={{ ["--c" as string]: `var(--k-${layer.id})` }}>
              <span className="cov-line" aria-hidden />
              <span className="cov-num" aria-hidden>
                <span>{layer.count}</span>
              </span>
              <div className="cov-copy">
                <h3 className="t-h3">
                  <span className="sr-only">{layer.count} </span>
                  {layer.unit}
                </h3>
                <p className="t-body">{layer.title}.</p>
              </div>
              <div className="cov-items">
                {layer.id === "static" ? (
                  SCANNER_FAMILIES.map((fam) => (
                    <div key={fam.title} className="cov-fam">
                      <h4 className="t-label">{fam.title}</h4>
                      <ul className="cov-chips">
                        {fam.items.map((it) => (
                          <li key={it.name} className="cov-chip" data-opt={"optIn" in it && it.optIn ? "true" : undefined}>
                            {it.name}
                            {"optIn" in it && it.optIn ? <span className="sr-only"> (opt-in)</span> : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <ul className="cov-chips">
                    {LAYER_ITEMS[layer.id].map((name) => (
                      <li key={name} className="cov-chip">
                        {name}
                      </li>
                    ))}
                  </ul>
                )}
                {layer.id === "static" && (
                  <p className="cov-key t-small">
                    <i aria-hidden /> Opt-in
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
