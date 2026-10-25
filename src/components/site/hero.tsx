"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP, isCoarsePointer } from "@/lib/site/gsap";
import { HERO } from "@/lib/site/content";
import { WaitlistForm } from "@/components/site/waitlist-form";
import { ScanCard } from "@/components/site/scan-card";
import { scrollToTarget } from "@/lib/site/scroll";
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
        let split: SplitText | null = null;
        let tl: gsap.core.Timeline | null = null;
        let cancelled = false;

        const run = () => {
          if (cancelled || !h1.current) return;
          split = SplitText.create(h1.current, {
            type: "lines",
            mask: "lines",
            linesClass: "split-line",
            maskClass: "split-mask",
            aria: "auto",
          });
          gsap.set(h1.current, { autoAlpha: 1 });

          tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.15 });
          tl.fromTo(
            document.querySelector(".site-nav"),
            { autoAlpha: 0, y: -36 },
            { autoAlpha: 1, y: 0, duration: 1.2 },
            0.3,
          )
            .fromTo(
              split.lines,
              { yPercent: 118, rotate: 3.5, fontVariationSettings: "'wdth' 72" },
              {
                yPercent: 0,
                rotate: 0,
                fontVariationSettings: "'wdth' 100",
                transformOrigin: "0% 100%",
                duration: 1.7,
                stagger: 0.14,
              },
              0.35,
            )
            .fromTo(
              root.current!.querySelectorAll("[data-intro]"),
              { autoAlpha: 0, y: 34 },
              { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.11 },
              0.95,
            );
        };

        if (document.fonts?.status === "loaded") run();
        else document.fonts?.ready.then(run);

        return () => {
          cancelled = true;
          tl?.kill();
          split?.revert();
        };
      });

      // card tilts toward the pointer — depth you can feel
      if (!isCoarsePointer()) {
        const card = cardWrap.current;
        if (card) {
          gsap.set(card, { transformPerspective: 1100, transformOrigin: "50% 60%" });
          const rx = gsap.quickTo(card, "rotationX", { duration: 0.9, ease: "power3.out" });
          const ry = gsap.quickTo(card, "rotationY", { duration: 0.9, ease: "power3.out" });
          const tz = gsap.quickTo(card, "y", { duration: 1.1, ease: "power3.out" });
          const move = (e: PointerEvent) => {
            const nx = (e.clientX / window.innerWidth) * 2 - 1;
            const ny = (e.clientY / window.innerHeight) * 2 - 1;
            ry(nx * 6);
            rx(-ny * 5);
            tz(ny * -6);
          };
          window.addEventListener("pointermove", move, { passive: true });
          return () => window.removeEventListener("pointermove", move);
        }
      }
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
          <p className="hero-kicker kicker" data-intro>
            {HERO.kicker}
          </p>
          <h1 id="hero-title" ref={h1} className="t-display hero-h1" data-hero-title>
            Attack your code
            <br className="hidden md:inline" /> before anyone else does.
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

      <button
        type="button"
        className="hero-cue"
        onClick={() => scrollToTarget("#how-it-works", { duration: 1.8 })}
        aria-label="Scroll to how it works"
      >
        <span>Travel down</span>
        <i aria-hidden />
      </button>
    </section>
  );
}
