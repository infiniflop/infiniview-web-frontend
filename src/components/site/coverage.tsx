"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/site/gsap";
import { aimLight, QUIET, setMood } from "@/lib/site/scene";
import { ARSENAL, LAYER_ITEMS, SCANNER_FAMILIES, STACKS } from "@/lib/site/content";
import { createPill } from "@/lib/site/motion";
import { prefersReducedMotion } from "@/lib/site/gsap";

/**
 * "Every layer, covered": the four layers of a scan, each with its number and, next to the number,
 * the things it counts. The 26 scanners are listed by name (from the product docs) so the claim can
 * be checked by reading it. No illustration: the names are the picture.
 */
type StackId = (typeof STACKS)[number]["id"];
const ALL_SCANNERS = SCANNER_FAMILIES.flatMap((f) => f.items as readonly { name: string; stack?: string; optIn?: boolean }[]);

export function Coverage() {
  const root = useRef<HTMLElement>(null);
  // "Pick your stack": the scanners written for that stack light up, the ones that read any
  // repository stay as they are, the rest step back
  const [stack, setStack] = useState<StackId | null>(null);
  const picker = useRef<HTMLDivElement>(null);
  const pillEl = useRef<HTMLSpanElement>(null);
  const pill = useRef<ReturnType<typeof createPill> | null>(null);
  useEffect(() => {
    const wrap = picker.current;
    const el = pillEl.current;
    if (!wrap || !el) return;
    const place = (instant = false) => {
      const target = wrap.querySelector<HTMLElement>(`[data-stack="${stack ?? "all"}"]`);
      if (!target) return;
      pill.current ??= createPill(el);
      pill.current.to({ x: target.offsetLeft, y: target.offsetTop, w: target.offsetWidth, h: target.offsetHeight }, instant || prefersReducedMotion());
    };
    place();
    const snap = () => place(true);
    const ro = new ResizeObserver(snap);
    wrap.querySelectorAll("[data-stack]").forEach((b) => ro.observe(b));
    return () => ro.disconnect();
  }, [stack]);
  useEffect(() => () => pill.current?.stop(), []);
  const specific = stack ? ALL_SCANNERS.filter((x) => x.stack === stack) : [];
  const pickStack = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const ids: (StackId | null)[] = [null, ...STACKS.map((x) => x.id)];
    const cur = ids.indexOf(stack);
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (cur + 1) % ids.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (cur - 1 + ids.length) % ids.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = ids.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setStack(ids[next]);
    picker.current?.querySelectorAll<HTMLElement>("[data-stack]")[next]?.focus();
  };

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
            // (inline styles are cleared at the end: the stack picker dims chips from the stylesheet)
            .fromTo(chips, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out", stagger: { each: 0.018, from: "start" }, clearProps: "opacity,transform" }, 0.22);
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
                  <>
                    <div className="cov-pick">
                      <span id="cov-pick-label" className="t-label">
                        Pick your stack
                      </span>
                      <div ref={picker} className="cov-stacks" role="radiogroup" aria-labelledby="cov-pick-label">
                        <span ref={pillEl} className="cov-stack-pill" aria-hidden />
                        {[{ id: null, label: "All" }, ...STACKS].map((x) => (
                          <button
                            key={x.label}
                            type="button"
                            role="radio"
                            aria-checked={stack === x.id}
                            tabIndex={stack === x.id ? 0 : -1}
                            data-stack={x.id ?? "all"}
                            className="cov-stack"
                            onClick={() => setStack(x.id as StackId | null)}
                            onKeyDown={pickStack}
                          >
                            {x.label}
                          </button>
                        ))}
                      </div>
                      <p className="cov-pick-out t-small" aria-live="polite">
                        {stack
                          ? `${specific.length === 1 ? "One scanner is" : `${specific.length} scanners are`} written for ${STACKS.find((x) => x.id === stack)!.label}: ${specific.map((x) => x.name).join(", ")}.`
                          : "26 scanners in four families."}
                      </p>
                    </div>
                    {SCANNER_FAMILIES.map((fam) => (
                      <div key={fam.title} className="cov-fam">
                        <h4 className="t-label">{fam.title}</h4>
                        <ul className="cov-chips" data-picking={stack ? "true" : undefined}>
                          {(fam.items as readonly { name: string; stack?: string; optIn?: boolean }[]).map((it) => (
                            <li
                              key={it.name}
                              className="cov-chip"
                              data-opt={it.optIn ? "true" : undefined}
                              data-hit={stack && it.stack === stack ? "true" : undefined}
                              data-off={stack && it.stack && it.stack !== stack ? "true" : undefined}
                            >
                              {it.name}
                              {it.optIn ? <span className="sr-only"> (opt-in)</span> : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </>
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
