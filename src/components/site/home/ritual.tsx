"use client";

// How it works, performed by the scene. The stage pins for the length of a
// run; scroll scrubs the glass block through the product's seven phases,
// while the copy changes phase by phase on its own quick clock so reading
// never feels dragged through a scrub.

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PHASES } from "../content";
import { scene } from "../scene/store";
import { gsap, ScrollTrigger, useGSAP } from "../motion/gsap";
import { SplitHeading } from "../motion/split-heading";
import { heroRun } from "./run-console";

const N = PHASES.length;

export function Ritual() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const header = root.current!.querySelector("[data-ritual-header]")!;
        const phases = gsap.utils.toArray<HTMLElement>("[data-phase]", root.current);
        const fills = gsap.utils.toArray<HTMLElement>("[data-fill]", root.current);

        // Leaving the hero: the sealed block comes apart, ready for a fresh run.
        gsap.timeline({
          scrollTrigger: {
            trigger: header,
            start: "top 85%",
            endTrigger: stage.current,
            end: "top top",
            // No lag here: a smoothed scrub could land after the run's own
            // timeline has started and overwrite the block it just sealed.
            scrub: true,
            onEnter: () => heroRun.kill(),
          },
        }).to(scene, {
          assemble: 0,
          findings: 0,
          paths: 0,
          extract: 0,
          scanOn: 0,
          graph: 0,
          zoom: 0,
          spin: 0,
          probes: 0,
          layers: 0.55,
          spread: 0.18,
          ease: "none",
        });

        // The run, phase by phase. One unit of timeline per phase.
        const tl = gsap.timeline({ defaults: { ease: "none", immediateRender: false } });
        const ft = (from: gsap.TweenVars, to: gsap.TweenVars, at: number, dur = 1) =>
          tl.fromTo(scene, from, { ...to, duration: dur }, at);

        // Setup: voxels seal into the block around the code
        ft({ assemble: 0, layers: 0.55 }, { assemble: 1, layers: 0.9, ease: "power2.out" }, 0, 0.9);
        // Graph build
        ft({ spread: 0.18, graph: 0 }, { spread: 0.95, graph: 1, ease: "power1.inOut" }, 1);
        // Scanning: the sheet sweeps up twice
        ft({ scanOn: 0 }, { scanOn: 1 }, 2, 0.1);
        ft({ scan: 0 }, { scan: 1, ease: "power1.inOut" }, 2, 0.5);
        ft({ scan: 0 }, { scan: 1, ease: "power1.inOut" }, 2.5, 0.45);
        ft({ scanOn: 1, graph: 1 }, { scanOn: 0, graph: 0.3 }, 2.9, 0.1);
        // Analysis: findings light, the attack path draws
        ft({ findings: 0 }, { findings: 1 }, 3, 0.75);
        ft({ paths: 0 }, { paths: 1, ease: "power2.out" }, 3.45, 0.5);
        ft({ spread: 0.95 }, { spread: 0.55, ease: "power1.inOut" }, 3, 1);
        // Review: closer, turning
        ft({ zoom: 0, spin: 0 }, { zoom: 0.55, spin: 0.55, ease: "power1.inOut" }, 4);
        // Testing: the agents attack
        ft({ probes: 0 }, { probes: 1, ease: "power2.out" }, 5, 0.4);
        ft({ zoom: 0.55, spin: 0.55 }, { zoom: 0.15, spin: 1.05, ease: "power1.inOut" }, 5);
        // Report: proof lifts out, then the sandbox is destroyed
        ft({ extract: 0, paths: 1 }, { extract: 1, paths: 0, ease: "power2.inOut" }, 6, 0.45);
        ft({ probes: 1, zoom: 0.15 }, { probes: 0, zoom: 0, ease: "power1.out" }, 6, 0.5);
        ft({ shatter: 0 }, { shatter: 1, ease: "power2.in" }, 6.4, 0.6);

        const show = (i: number) => {
          if (i === activeRef.current) return;
          const prev = phases[activeRef.current];
          const next = phases[i];
          const dir = i > activeRef.current ? 1 : -1;
          activeRef.current = i;
          setActive(i);
          gsap.to(prev, { autoAlpha: 0, y: -36 * dir, duration: 0.4, ease: "power2.in", overwrite: true });
          gsap.fromTo(
            next,
            { autoAlpha: 0, y: 44 * dir },
            { autoAlpha: 1, y: 0, duration: 0.75, delay: 0.12, ease: "iv", overwrite: true },
          );
          const name = next.querySelector<HTMLElement>("[data-phase-name]");
          if (name) {
            gsap.to(name, {
              duration: 0.7,
              delay: 0.12,
              scrambleText: { text: PHASES[i].name, chars: "▮▯01<>/", speed: 0.6, revealDelay: 0.15 },
            });
          }
        };

        gsap.set(phases, { autoAlpha: 0 });
        gsap.set(phases[0], { autoAlpha: 1 });

        ScrollTrigger.create({
          trigger: stage.current,
          start: "top top",
          end: () => `+=${window.innerHeight * 0.8 * N}`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.6,
          animation: tl,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress * N;
            show(Math.min(N - 1, Math.floor(p)));
            fills.forEach((f, i) => gsap.set(f, { scaleX: Math.min(1, Math.max(0, p - i)) }));
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(scene, { assemble: 1, findings: 1, paths: 1, spread: 0.6, layers: 0.9, probes: 0.3 });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="how-it-works" className="relative z-10" aria-labelledby="ritual-title">
      <div data-ritual-header className="frame grid grid-cols-1 gap-8 pt-[clamp(120px,16vw,240px)] pb-[clamp(60px,8vw,120px)] lg:grid-cols-12">
        <SplitHeading id="ritual-title" className="t-h2 lg:col-span-8">
          Reading code isn&apos;t testing it.
        </SplitHeading>
        <p data-reveal className="t-lead text-ink lg:col-span-6 lg:col-start-1">
          AI writes a growing share of what you ship, faster than anyone can review it. Scanners that only read
          source miss what happens when it runs. Infiniview builds it, runs it and attacks it, the way someone
          eventually will.
        </p>
        <p data-reveal className="text-ink-2 lg:col-span-5 lg:col-start-1">
          Every run moves through the same seven phases, whether it starts from the dashboard, a pull request, or an{" "}
          <code className="t-code text-ink">@infiniview review</code> comment.
        </p>
      </div>

      {/* The pinned stage */}
      <div
        ref={stage}
        className="relative flex h-[100svh] flex-col motion-reduce:h-auto"
      >
        <div className="frame relative flex flex-1 flex-col justify-end pb-[clamp(24px,4vh,48px)] pt-24 motion-reduce:justify-start">
          <div className="relative grid grid-cols-1 lg:grid-cols-12">
            <div className="relative min-h-[340px] lg:col-span-5 lg:min-h-[380px] motion-reduce:min-h-0">
              {PHASES.map((p, i) => (
                <article
                  key={p.name}
                  data-phase
                  className={cn(
                    "absolute inset-x-0 bottom-0 motion-reduce:relative motion-reduce:mb-14 motion-reduce:!visible motion-reduce:!opacity-100",
                    i !== 0 && "invisible opacity-0",
                  )}
                  aria-hidden={i !== active}
                >
                  <p
                    data-phase-name
                    className="t-h2 text-flare [font-variation-settings:'wdth'_125]"
                    aria-label={p.name}
                  >
                    {p.name}
                  </p>
                  <h3 className="t-h3 mt-6 max-w-[22ch]">{p.title}</h3>
                  <p className="mt-4 max-w-[46ch] text-ink-2">{p.body}</p>
                </article>
              ))}
            </div>
          </div>

          {/* Run timeline, the way the dashboard labels it */}
          <ol
            data-ui
            className="mt-[clamp(28px,5vh,56px)] grid grid-cols-7 gap-1.5 motion-reduce:hidden"
            aria-label="Pipeline phases"
          >
            {PHASES.map((p, i) => (
              <li key={p.name} className="min-w-0">
                <div className="h-[3px] overflow-hidden bg-ink/[0.12]">
                  <div data-fill className="h-full origin-left scale-x-0 bg-flare" />
                </div>
                <p
                  className={cn(
                    "mt-2.5 truncate text-[0.875rem] transition-colors duration-300 max-sm:hidden",
                    i === active ? "text-ink" : i < active ? "text-ink-2" : "text-ink-3",
                  )}
                >
                  {p.name}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
