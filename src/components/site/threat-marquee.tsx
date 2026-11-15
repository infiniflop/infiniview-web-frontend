"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/site/gsap";
import { scene } from "@/lib/site/scene";
import { THREATS } from "@/lib/site/content";
import { applyGlassMap, buildGlassMap } from "@/lib/site/glass";

/**
 * A threshold between the opening and the argument: the attack classes, in two rows of outlined
 * type, pulled through a slab of glass. Outside the slab they are outlines; inside it they are
 * caught: solid, lit, and bent at the rim (a second copy of the rows, held in register and
 * displaced by a map built for the slab, so the refraction is real in every engine). Scroll speed
 * pushes the rows.
 */
export function ThreatMarquee() {
  const root = useRef<HTMLElement>(null);
  const slab = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const host = root.current;
      const slabEl = slab.current;
      if (!host || !slabEl) return;
      const rowsA = gsap.utils.toArray<HTMLElement>("[data-row='a']", host);
      const rowsB = gsap.utils.toArray<HTMLElement>("[data-row='b']", host);

      // the slab's refraction map, for its exact size
      const fx = slabEl.querySelector<HTMLElement>(".slab-fx");
      const build = () => {
        const w = slabEl.offsetWidth;
        const h = slabEl.offsetHeight;
        if (!w || !h || !fx) return;
        const map = buildGlassMap({ width: w, height: h, radius: Math.min(w, h) * 0.2, bezel: Math.min(26, w * 0.12), depth: 30, zoom: 1.1 }, 22);
        fx.dataset.fx = applyGlassMap(document.getElementById("glass-slab") as SVGFilterElement | null, map, 0.1) ? "on" : "off";
      };
      build();
      const ro = new ResizeObserver(build);
      ro.observe(slabEl);

      // a media context, so the drift stops (and the rows return to rest) if reduced motion is
      // switched on while the page is open, and starts again if it is switched off
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // both copies of a row are moved by the same tween, so they can never drift apart
        const tlA = gsap.to(rowsA, { xPercent: -50, ease: "none", duration: 70, repeat: -1 });
        const tlB = gsap.fromTo(rowsB, { xPercent: -50 }, { xPercent: 0, ease: "none", duration: 84, repeat: -1 });

        let visible = true;
        const io = new IntersectionObserver(
          ([e]) => {
            visible = e.isIntersecting;
            // nothing to drift while it is off screen
            tlA.paused(!visible);
            tlB.paused(!visible);
          },
          { rootMargin: "120px" },
        );
        io.observe(host);

        const tick = () => {
          if (!visible) return;
          const boost = 1 + Math.abs(scene.velocity) * 16;
          tlA.timeScale(boost);
          tlB.timeScale(boost);
        };
        gsap.ticker.add(tick);
        return () => {
          gsap.ticker.remove(tick);
          io.disconnect();
        };
      });
      return () => {
        ro.disconnect();
        mm.revert();
      };
    },
    { scope: root },
  );

  const rows = (copy: "base" | "lit") => (
    <div className={`threat-rows threat-rows--${copy}`}>
      {(["a", "b"] as const).map((r) => (
        <div key={r} className="threat-row">
          <div className="threat-track" data-row={r}>
            {[0, 1].map((n) => (
              <div key={n} className="threat-run">
                {(r === "a" ? THREATS : [...THREATS].reverse()).map((t) => (
                  <span key={t} className="threat-item">
                    {t}
                    <i />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section ref={root} className="threat" aria-labelledby="threat-title">
      <h2 id="threat-title" className="sr-only">
        The attack classes Infiniview runs against your app
      </h2>
      {/* the moving rows are decoration (aria-hidden): the same classes, once, as a list */}
      <ul className="sr-only">
        {THREATS.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <div className="threat-band" aria-hidden>
        {rows("base")}
        <div ref={slab} className="slab">
          <div className="slab-fx">
            <div className="slab-view">{rows("lit")}</div>
          </div>
          <span className="slab-body" />
        </div>
      </div>
    </section>
  );
}
