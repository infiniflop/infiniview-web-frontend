"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/site/gsap";
import { HERO } from "@/lib/site/content";
import { WaitlistForm } from "@/components/site/waitlist-form";
import { ScanCard } from "@/components/site/scan-card";
import { setMood } from "@/lib/site/scene";
import { whenFirstScreen } from "@/lib/site/ready";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const h1 = useRef<HTMLHeadingElement>(null);
  const cardWrap = useRef<HTMLDivElement>(null);
  // the headline's letters (set by the split), and whether its entrance has finished: the pointer
  // only plays the type once the line has landed
  const chars = useRef<HTMLElement[]>([]);
  const landed = useRef(false);

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

        // The whole first screen waits for the corridor's first frame and the web font (capped), then
        // plays as one piece: nothing is visible while it waits, so there are no stray fragments of
        // text over an empty background and no replay when a late canvas arrives.
        let split: ReturnType<typeof SplitText.create> | null = null;
        let tl: gsap.core.Timeline | null = null;
        const play = () => {
          // The headline is split into masked lines. autoSplit re-splits when the web font finishes
          // loading or the width changes, so line breaks are never frozen at fallback-font metrics
          // (document.fonts.status can read "loaded" before the font was even requested).
          split = SplitText.create(el, {
            type: "lines,chars",
            mask: "lines",
            autoSplit: true,
            linesClass: "split-line",
            charsClass: "split-char",
            aria: "auto",
            onSplit(self) {
              chars.current = self.chars as HTMLElement[];
              return gsap.fromTo(
                self.lines,
                // The mask is padded for descenders, so the lines start well below it: at 135% the
                // tops of capitals still showed inside the padding as stray slivers.
                { yPercent: 190, rotate: 3.5, fontVariationSettings: "'wdth' 72" },
                {
                  yPercent: 0,
                  rotate: 0,
                  fontVariationSettings: "'wdth' 100",
                  transformOrigin: "0% 100%",
                  duration: 1.6,
                  ease: "expo.out",
                  stagger: 0.12,
                  delay: 0.05,
                  // the headline itself only becomes visible as its first line starts to move
                  onStart: () => {
                    gsap.set(el, { autoAlpha: 1 });
                  },
                  onComplete: () => {
                    landed.current = true;
                  },
                },
              );
            },
          });

          // everything else arrives around the headline
          tl = gsap.timeline({ defaults: { ease: "expo.out" } });
          // (the nav's own entrance lives in the shell: it is layout, and must not replay each time the
          // visitor comes back to this page)
          tl.fromTo(
            root.current!.querySelectorAll("[data-intro]"),
            { opacity: 0, y: 34 },
            { opacity: 1, y: 0, duration: 1.2, stagger: 0.11 },
            0.4,
          );
        };
        const cancelGate = whenFirstScreen(play);

        return () => {
          cancelGate();
          tl?.kill();
          split?.revert();
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

      // The headline is set in a variable face, so the pointer can reshape it: letters near the cursor
      // swell wider and heavier and relax again as it leaves. Springy on the way in (it is the
      // interface answering a hand), unhurried on the way out. Centres are measured at rest, once,
      // and again after a resize or re-split; nothing reads layout per frame.
      mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
        const host = h1.current;
        if (!host) return;
        const R = 230; // reach of the pointer, px
        let centres: { x: number; y: number }[] = [];
        let cur: number[] = [];
        let dirty = true;
        let px = -1e4;
        let py = -1e4;
        let raf = 0;
        const measure = () => {
          const list = chars.current;
          // measured with the type at rest, so the centres do not drift with the swell
          list.forEach((c) => (c.style.fontVariationSettings = ""));
          centres = list.map((c) => {
            const r = c.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          });
          cur = list.map(() => 0);
          dirty = false;
        };
        const frame = () => {
          raf = 0;
          const list = chars.current;
          if (!landed.current || !list.length) return;
          if (dirty || centres.length !== list.length) measure();
          let moving = false;
          for (let i = 0; i < list.length; i++) {
            const dx = centres[i].x - px;
            const dy = (centres[i].y - py) * 0.7; // a little taller than wide: whole words react, not just a letter
            const d = Math.hypot(dx, dy);
            const target = d < R ? Math.cos((d / R) * Math.PI * 0.5) ** 2 : 0;
            const rate = target > cur[i] ? 0.22 : 0.09; // in fast, out slow
            const next = cur[i] + (target - cur[i]) * rate;
            if (Math.abs(next - cur[i]) > 0.002 || next > 0.002) moving = true;
            cur[i] = next < 0.002 ? 0 : next;
            const t = cur[i];
            list[i].style.fontVariationSettings = t === 0 ? "" : `'wght' ${Math.round(620 + 230 * t)}, 'wdth' ${(100 + 14 * t).toFixed(1)}`;
          }
          if (moving) raf = requestAnimationFrame(frame);
        };
        const kick = () => {
          if (!raf) raf = requestAnimationFrame(frame);
        };
        const onMove = (e: PointerEvent) => {
          px = e.clientX;
          py = e.clientY;
          kick();
        };
        const onLeave = () => {
          px = -1e4;
          py = -1e4;
          kick();
        };
        const onResize = () => {
          dirty = true;
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        window.addEventListener("resize", onResize);
        return () => {
          window.removeEventListener("pointermove", onMove);
          document.documentElement.removeEventListener("pointerleave", onLeave);
          window.removeEventListener("resize", onResize);
          cancelAnimationFrame(raf);
          chars.current.forEach((c) => (c.style.fontVariationSettings = ""));
        };
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
