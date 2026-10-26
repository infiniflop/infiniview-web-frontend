"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/site/gsap";
import { scene } from "@/lib/site/scene";
import { THREATS } from "@/lib/site/content";
import { Mark } from "@/components/site/ui";

/**
 * A threshold between the opening and the argument. Two rows of attack classes
 * drift in opposite directions; scroll velocity pushes them and skews the type,
 * so the strip feels like it is being pulled through the glass.
 */
export function ThreatMarquee() {
  const root = useRef<HTMLElement>(null);
  const rowA = useRef<HTMLDivElement>(null);
  const rowB = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const a = rowA.current;
      const b = rowB.current;
      if (!a || !b) return;

      // a media context, so the drift stops (and the rows return to rest) if reduced motion is
      // switched on while the page is open, and starts again if it is switched off
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tlA = gsap.to(a, { xPercent: -50, ease: "none", duration: 80, repeat: -1 });
        const tlB = gsap.fromTo(b, { xPercent: -50 }, { xPercent: 0, ease: "none", duration: 95, repeat: -1 });

        const skewA = gsap.quickTo(a, "skewX", { duration: 0.6, ease: "power3.out" });
        const skewB = gsap.quickTo(b, "skewX", { duration: 0.6, ease: "power3.out" });

        let visible = true;
        const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: "200px" });
        io.observe(root.current!);

        const tick = () => {
          if (!visible) return;
          const v = scene.velocity;
          const boost = 1 + Math.abs(v) * 14;
          tlA.timeScale(boost);
          tlB.timeScale(boost);
          skewA(-v * 9);
          skewB(-v * 9);
        };
        gsap.ticker.add(tick);
        return () => {
          gsap.ticker.remove(tick);
          io.disconnect();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const run = (cls: string) => (
    <>
      {[0, 1].map((n) => (
        <div key={n} className={`threat-run ${cls}`} aria-hidden={n === 1 ? true : undefined}>
          {THREATS.map((t) => (
            <span key={t} className="threat-item">
              {t}
              <Mark size={28} className="threat-mark" />
            </span>
          ))}
        </div>
      ))}
    </>
  );

  return (
    <section ref={root} className="threat" aria-labelledby="threat-title">
      <h2 id="threat-title" className="sr-only">
        The attack classes Infiniview runs against your app
      </h2>
      <div className="threat-row" aria-hidden>
        <div ref={rowA} className="threat-track">{run("threat-run--big")}</div>
      </div>
      <div className="threat-row threat-row--small" aria-hidden>
        <div ref={rowB} className="threat-track">{run("threat-run--small")}</div>
      </div>
    </section>
  );
}
