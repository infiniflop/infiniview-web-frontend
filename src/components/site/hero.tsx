"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/site/gsap";
import { HERO } from "@/lib/site/content";
import { WaitlistForm } from "@/components/site/waitlist-form";
import { ScanCard } from "@/components/site/scan-card";
import { setMood } from "@/lib/site/scene";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const h1 = useRef<HTMLHeadingElement>(null);
  const cardWrap = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(h1.current, { autoAlpha: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const el = h1.current;
        if (!el) return;
        // the failsafe already showed this page (slow connection): do not hide it again to play the intro
        if (document.documentElement.classList.contains("reveal-failsafe")) {
          gsap.set(el, { autoAlpha: 1 });
          return;
        }

        // The headline is split into masked lines. autoSplit re-splits when the web font finishes
        // loading or the width changes, so line breaks are never frozen at fallback-font metrics
        // (document.fonts.status can read "loaded" before the font was even requested).
        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          linesClass: "split-line",
          aria: "auto",
          onSplit(self) {
            gsap.set(el, { autoAlpha: 1 });
            return gsap.fromTo(
              self.lines,
              { yPercent: 135, rotate: 3.5, fontVariationSettings: "'wdth' 72" },
              {
                yPercent: 0,
                rotate: 0,
                fontVariationSettings: "'wdth' 100",
                transformOrigin: "0% 100%",
                duration: 1.7,
                ease: "expo.out",
                stagger: 0.14,
                delay: 0.5,
              },
            );
          },
        });

        // never leave the headline invisible if the split is somehow delayed
        const reveal = window.setTimeout(() => gsap.set(el, { autoAlpha: 1 }), 3000);

        // everything else arrives around the headline
        const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.15 });
        // (the nav's own entrance lives in the shell: it is layout, and must not replay each time the
        // visitor comes back to this page)
        tl.fromTo(
          root.current!.querySelectorAll("[data-intro]"),
          { opacity: 0, y: 34 },
          { opacity: 1, y: 0, duration: 1.2, stagger: 0.11 },
          0.95,
        );

        return () => {
          window.clearTimeout(reveal);
          tl.kill();
          split.revert();
        };
      });

      // The card tilts toward the pointer: depth you can feel. It is a media condition of its own, so
      // if the motion or pointer preference changes while the page is open the listener is removed
      // and the card is released.
      mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
        const card = cardWrap.current;
        if (!card) return;
        gsap.set(card, { transformPerspective: 1100, transformOrigin: "50% 60%" });
        const rx = gsap.quickTo(card, "rotationX", { duration: 0.9, ease: "power3.out" });
        const ry = gsap.quickTo(card, "rotationY", { duration: 0.9, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          const nx = (e.clientX / window.innerWidth) * 2 - 1;
          const ny = (e.clientY / window.innerHeight) * 2 - 1;
          ry(nx * 6);
          rx(-ny * 5);
        };
        window.addEventListener("pointermove", move, { passive: true });
        return () => window.removeEventListener("pointermove", move);
      });

      return () => mm.revert(); // also reverts the SplitText, timelines and tilt created inside
    },
    { scope: root },
  );

  // the opening mood: cool light, a calm portal
  useGSAP(() => {
    setMood({ alert: 0, energy: 1, portal: 0.55, width: 1 }, 1.2);
  });

  return (
    <section ref={root} id="top" className="hero" aria-labelledby="hero-title">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1 id="hero-title" ref={h1} className="t-display hero-h1" data-hero-title>
            {/* block only on wide screens; a <br> would be honoured by SplitText at every width */}
            <span className="md:block">Attack your code</span> <span>before anyone else does.</span>
          </h1>
        </div>

        <div className="hero-sub">
          <p className="t-lede hero-lede" data-intro>
            {HERO.lede}
          </p>
          <div data-intro>
            <WaitlistForm id="waitlist" />
          </div>
          <ul className="hero-assure" data-intro>
            {HERO.assurances.map((a) => (
              <li key={a}>
                <i aria-hidden />
                {a}
              </li>
            ))}
          </ul>
        </div>

        <div ref={cardWrap} className="hero-card" data-intro>
          <ScanCard />
        </div>
      </div>
    </section>
  );
}
