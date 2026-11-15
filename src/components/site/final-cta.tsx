"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/site/gsap";
import { scene, setMood } from "@/lib/site/scene";
import { CTA, DOCS_URL } from "@/lib/site/content";
import { WaitlistForm } from "@/components/site/waitlist-form";
import { DUR, EASE } from "@/lib/site/motion";

/**
 * The end. The mark is a frame inside a frame; here its inner frame opens like an aperture and the
 * page floods with lime: the one place the brand colour owns the whole screen.
 */
export function FinalCta() {
  const root = useRef<HTMLElement>(null);
  const field = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const f = field.current!;
        // the aperture is the mark's rounded square: it opens from the middle of the screen to its edges
        gsap.fromTo(
          f,
          { clipPath: "inset(44% 40% 44% 40% round 64px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 0px)",
            ease: "power2.inOut",
            scrollTrigger: { trigger: root.current, start: "top 88%", end: "top 6%", scrub: 0.6 },
          },
        );
        // the content arrives once the aperture is mostly open (opacity only: it stays focusable)
        ScrollTrigger.create({
          trigger: root.current,
          start: "top 36%",
          once: true,
          onEnter: () => {
            const els = gsap.utils.toArray<HTMLElement>("[data-cta]:not([data-revealed])", f);
            if (!els.length) return;
            els.forEach((el) => el.setAttribute("data-revealed", ""));
            gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: DUR.hero, ease: EASE.out, stagger: 0.08, clearProps: "transform" });
          },
        });
        // frames keep receding into the middle (the loop is the point) but only while the finale is on screen
        const iris = gsap.to(f.querySelectorAll(".cta-iris i"), {
          scale: 0.1,
          opacity: 0,
          duration: 8,
          ease: "none",
          repeat: -1,
          stagger: { each: -1.6, from: "start" },
          paused: true,
        });
        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? iris.play() : iris.pause()),
        });
        // once the aperture is fully open the lime field covers every pixel: the wall can rest
        ScrollTrigger.create({
          trigger: root.current,
          start: "top 3%",
          end: "bottom 97%",
          onToggle: (self) => {
            scene.occluded = self.isActive;
          },
        });
        ScrollTrigger.create({
          trigger: root.current,
          start: "top 70%",
          end: "bottom 30%",
          // the light gathers behind the aperture and turns to proof as it opens
          onEnter: () => setMood({ x: 0.5, y: 0.46, spread: 0.3, energy: 0.9, alert: 0, proof: 1 }, 1.2),
          onEnterBack: () => setMood({ x: 0.5, y: 0.46, spread: 0.3, energy: 0.9, alert: 0, proof: 1 }, 0.6),
          // beyond the finale the wall returns, but quiet: the footer is read, not watched
          onLeave: () => setMood({ x: 0.5, y: 0.08, spread: 0.26, energy: 0.4, alert: 0, proof: 0.6 }, 1.4),
          onLeaveBack: () => setMood({ x: 0.92, y: 0.2, spread: 0.22, energy: 0.45, alert: 0, proof: 0 }, 1),
        });
        return () => {
          scene.occluded = false;
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="challenge" className="cta" aria-labelledby="cta-title">
      <div ref={field} className="cta-field">
        <div className="cta-iris" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <i key={i} />
          ))}
        </div>
        <div className="wrap cta-inner">
          <h2 id="cta-title" className="t-display cta-title" data-cta>
            {CTA.title}
          </h2>
          <div className="cta-side">
            <p className="cta-body" data-cta>
              {CTA.body}
            </p>
            <div data-cta className="cta-form">
              <WaitlistForm id="waitlist-cta" size="md" />
            </div>
            <div className="cta-actions" data-cta>
              <a href={DOCS_URL} className="btn btn--ink">
                Read the docs
                <ArrowRight className="arrow" size={17} strokeWidth={2.6} />
              </a>
              <a href="/preview" className="cta-link">
                Open the live demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
