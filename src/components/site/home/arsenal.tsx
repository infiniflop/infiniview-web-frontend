"use client";

// The arsenal as a manifest: every scanner Infiniview runs, set large, one
// per line. A scan line holds the middle of the screen; each name widens
// and brightens as it passes through it, the way the scan sheet passes
// through the code in the glass.

import { useRef } from "react";
import { AGENT_SURFACES, CAPABILITIES, FAMILIES } from "../content";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "../motion/gsap";
import { SplitHeading } from "../motion/split-heading";

const TOTAL = FAMILIES.reduce((n, f) => n + f.tools.length, 0);

export function Arsenal() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-tool]", root.current);
      if (prefersReducedMotion()) {
        rows.forEach((r) => r.style.setProperty("--k", "1"));
        return;
      }
      // Measure once per refresh; names change width only, never height,
      // so the offsets stay valid while the effect runs.
      let centers: number[] = [];
      const measure = () => {
        centers = rows.map((r) => {
          const b = r.getBoundingClientRect();
          return b.top + window.scrollY + b.height / 2;
        });
      };
      measure();
      ScrollTrigger.addEventListener("refresh", measure);

      const last = new Float32Array(rows.length).fill(-1);
      const tick = () => {
        const mid = window.scrollY + window.innerHeight / 2;
        const reach = window.innerHeight * 0.32;
        for (let i = 0; i < rows.length; i++) {
          const d = Math.abs(centers[i] - mid) / reach;
          const k = Math.max(0, 1 - d * d);
          const q = Math.round(k * 40) / 40;
          if (q !== last[i]) {
            last[i] = q;
            rows[i].style.setProperty("--k", q.toFixed(3));
          }
        }
      };

      const st = ScrollTrigger.create({
        trigger: "[data-manifest]",
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)),
      });
      tick();

      return () => {
        gsap.ticker.remove(tick);
        ScrollTrigger.removeEventListener("refresh", measure);
        st.kill();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="arsenal" className="relative z-10 bg-void-2" aria-labelledby="arsenal-title">
      <div className="frame section-gap">
        <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-12">
          <SplitHeading id="arsenal-title" className="t-h2 lg:col-span-9">
            25 scanners, then the agents.
          </SplitHeading>
          <p data-reveal className="t-lead max-w-[38ch] lg:col-span-6">
            Every scan draws on the same five capabilities. Coverage is reported tool by tool, so the result always
            says what actually ran, and a skipped scanner never passes for a clean one.
          </p>
        </div>

        {/* The manifest */}
        <div data-manifest className="relative mt-[clamp(72px,9vw,140px)]">
          <div className="pointer-events-none absolute inset-y-0 right-0 left-0 hidden lg:left-[33.4%] lg:block" aria-hidden>
            <div className="sticky top-1/2 h-0">
              <div className="scan-beam absolute inset-x-0 -top-px h-[2px]" />
            </div>
          </div>

          {FAMILIES.map((f) => {
            const opt = f.tools.filter((t) => t.optIn).length;
            return (
              <div key={f.name} className="grid grid-cols-1 border-ink/0 pb-[clamp(56px,7vw,110px)] lg:grid-cols-12">
                <div className="mb-6 lg:col-span-4 lg:mb-0">
                  <div className="lg:sticky lg:top-[28vh]">
                    <h3 className="t-h3">{f.name}</h3>
                    <p className="mt-3 max-w-[30ch] text-ink-2">
                      {f.summary}{" "}
                      <span className="tabular text-ink-3">
                        {f.tools.length} tools{opt ? `, ${opt} opt-in` : ""}.
                      </span>
                    </p>
                  </div>
                </div>
                <ul className="lg:col-span-8">
                  {f.tools.map((t) => (
                    <li
                      key={t.name}
                      data-tool
                      className="tool-row grid items-baseline gap-x-8 gap-y-1 py-[0.2em] sm:grid-cols-[minmax(0,1fr)_minmax(0,15rem)]"
                    >
                      <span className="tool-name">{t.name}</span>
                      <span className="tool-does text-[1.0625rem] leading-snug">
                        {t.does}
                        {t.optIn && <span className="ml-2 whitespace-nowrap text-ink-3">Opt-in</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <p className="sr-only">{TOTAL} scanners in total.</p>
        </div>

        {/* Then the agents */}
        <div className="mt-[clamp(40px,6vw,96px)] grid grid-cols-1 gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h3 className="t-h2 max-w-[10ch]" data-reveal>
              Then the agents.
            </h3>
            <p data-reveal className="mt-8 max-w-[36ch] text-ink-2">
              Once the repo builds, runtime agents probe the running app inside the sandbox and attach replay
              artifacts to anything they confirm.
            </p>
            <ul className="mt-10 flex flex-col">
              {AGENT_SURFACES.map((s) => (
                <li
                  key={s}
                  data-reveal
                  className="t-h3 group flex items-center gap-4 py-2"
                >
                  <span className="h-2.5 w-2.5 shrink-0 bg-flare transition-transform duration-300 group-hover:rotate-45" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <dl className="flex flex-col gap-10 lg:col-span-6 lg:col-start-7 lg:pt-[clamp(0px,9vw,150px)]">
            {CAPABILITIES.map((c) => (
              <div key={c.name} data-reveal className="grid gap-x-8 gap-y-3 sm:grid-cols-[minmax(0,15rem)_1fr]">
                <dt className="text-[1.25rem] font-[650] leading-tight tracking-[-0.02em] [font-variation-settings:'wdth'_112]">
                  {c.name}
                </dt>
                <dd className="max-w-[44ch] text-ink-2">{c.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
