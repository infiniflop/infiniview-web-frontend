"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/site/gsap";
import { scene, setMood } from "@/lib/site/scene";
import { CTA, DOCS_URL } from "@/lib/site/content";
import { WaitlistForm } from "@/components/site/waitlist-form";
import { Magnetic } from "@/components/site/ui";

/**
 * The end of the corridor. The vanishing point opens like an aperture and the
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
        // iris opens from where the portal sits on wide screens
        const wide = window.matchMedia("(min-width: 1024px)").matches;
        let lastMoodStep = -1;
        const origin = wide ? "74% 46%" : "50% 30%";
        gsap.fromTo(
          f,
          { clipPath: `circle(0% at ${origin})` },
          {
            clipPath: `circle(150% at ${origin})`,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: root.current,
              start: "top 85%",
              end: "top 5%",
              scrub: 0.7,
              onUpdate: (self) => {
                // one mood tween per step of progress, not one per scroll tick
                const q = Math.round(self.progress * 25);
                if (q === lastMoodStep) return;
                lastMoodStep = q;
                setMood({ portal: 0.5 + (q / 25) * 1.1, energy: 1 + (q / 25) * 0.4 }, 0.4);
              },
            },
          },
        );
        // the content arrives once the aperture is mostly open (opacity only: it stays focusable)
        ScrollTrigger.create({
          trigger: root.current,
          start: "top 38%",
          once: true,
          onEnter: () => {
            const els = gsap.utils.toArray<HTMLElement>("[data-cta]:not([data-revealed])", f);
            if (!els.length) return;
            els.forEach((el) => el.setAttribute("data-revealed", ""));
            gsap.fromTo(
              els,
              { y: 60, opacity: 0 },
              { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", stagger: 0.12, clearProps: "transform" },
            );
          },
        });
        // concentric frames keep receding — the loop is the point — but only while the finale is on screen
        const iris = gsap.to(f.querySelectorAll(".iris-f"), {
          scale: 0.12,
          duration: 7,
          ease: "none",
          repeat: -1,
          stagger: { each: -1.4, from: "start" },
          opacity: 0,
          paused: true,
        });
        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? iris.play() : iris.pause()),
        });
        // once the aperture is fully open the lime field covers every pixel: the corridor can rest
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
          start: "top 20%",
          end: "bottom 30%",
          onLeaveBack: () => setMood({ portal: 0.55, energy: 1 }, 1),
          // beyond the finale the corridor returns, but quiet: the footer is read, not watched
          onLeave: () => setMood({ portal: 0.3, energy: 0.7, alert: 0 }, 1.4),
          onEnterBack: () => setMood({ portal: 1.6, energy: 1.4 }, 0.6),
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
        <div className="iris" aria-hidden>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <i key={i} className="iris-f" style={{ ["--i" as string]: i }} />
          ))}
        </div>
        <div className="wrap cta-inner">
          <h2 id="cta-title" className="t-display cta-title" data-cta>
            Think your app is unbreakable?
          </h2>
          <div className="cta-side">
            <p className="cta-body" data-cta>
              {CTA.body}
            </p>
            <div data-cta className="cta-form">
              <WaitlistForm id="waitlist-cta" size="md" />
            </div>
            <div className="cta-actions" data-cta>
              <Magnetic>
                <a href={DOCS_URL} className="btn btn--ink">
                  Read the docs
                  <ArrowRight className="arrow" size={17} strokeWidth={2.6} />
                </a>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
