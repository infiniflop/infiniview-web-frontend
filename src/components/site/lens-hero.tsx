"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger, SplitText, MOTION_OK } from "@/lib/gsap";
import { ShaderField } from "@/components/site/shader-field";
import { PRStage } from "@/components/site/pr-stage";
import { WaitlistForm } from "@/components/waitlist-form";
import { cn } from "@/lib/utils";

const LENS_R = 150;

/**
 * The hero. Two complete layers of the same composition sit on top of each
 * other: the surface (a pull request that passed its checks) and the
 * evidence (the same pull request as Infiniview saw it). A glass lens follows
 * the pointer and clips the evidence layer into view. Scrolling opens the
 * lens until the evidence fills the screen.
 */
export function LensHero() {
  const root = useRef<HTMLElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const lens = useRef({ x: 0, y: 0, glow: 0.7 });
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (min-width: 1024px)");
    const apply = () => setInteractive(fine.matches);
    apply();
    fine.addEventListener("change", apply);
    return () => fine.removeEventListener("change", apply);
  }, []);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      /* ── Entrance ─────────────────────────────────────────────────── */
      mm.add(MOTION_OK, () => {
        const h1 = el.querySelectorAll<HTMLElement>("[data-h1]");
        const splits = Array.from(h1).map((h) =>
          SplitText.create(h, { type: "lines", mask: "lines", linesClass: "split-line", autoSplit: true }),
        );
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        splits.forEach((s) => {
          tl.from(s.lines, { yPercent: 110, duration: 1.1, stagger: 0.09 }, 0.1);
        });
        tl.from("[data-copy]", { y: 18, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.5)
          .from("[data-stage]", { y: 40, opacity: 0, duration: 1.2, ease: "power3.out" }, 0.35)
          .from(ring.current, { scale: 0.4, opacity: 0, duration: 1, ease: "power3.out" }, 0.9);
        return () => splits.forEach((s) => s.revert());
      });

      /* ── Lens: pointer, drift, and the scroll that opens it ───────── */
      mm.add(
        { fine: "(pointer: fine) and (min-width: 1024px)", ok: MOTION_OK },
        (ctx) => {
          const { fine, ok } = ctx.conditions as { fine: boolean; ok: boolean };
          // The lens needs a fine pointer, a wide viewport, and motion allowed.
          if (!ok || !fine) {
            el.style.setProperty("--lens-r", "0px");
            return;
          }
          const stages = el.querySelectorAll<HTMLElement>("[data-stage]");
          const stage = stages[0];
          const copy = el.querySelectorAll<HTMLElement>("[data-copy-col]");
          const evidenceBits = el.querySelectorAll<HTMLElement>("[data-ev]");
          const caption = el.querySelector<HTMLElement>("[data-caption]")!;

          const pos = { x: 0, y: 0 }; // smoothed lens centre (px, relative to hero)
          const target = { x: 0, y: 0 };
          const state = { p: 0, r: LENS_R, pointer: false, lastMove: 0 };

          const stageCenter = () => {
            const a = el.getBoundingClientRect();
            const b = stage.getBoundingClientRect();
            return { x: b.left - a.left + b.width * 0.5, y: b.top - a.top + b.height * 0.5 };
          };
          const c0 = stageCenter();
          pos.x = target.x = c0.x - 40;
          pos.y = target.y = c0.y - 20;

          const setX = gsap.quickSetter(el, "--lens-x", "px");
          const setY = gsap.quickSetter(el, "--lens-y", "px");
          const setR = gsap.quickSetter(el, "--lens-r", "px");

          const onMove = (e: PointerEvent) => {
            if (!fine || e.pointerType !== "mouse") return;
            const a = el.getBoundingClientRect();
            target.x = e.clientX - a.left;
            target.y = e.clientY - a.top;
            state.pointer = true;
            state.lastMove = performance.now();
          };
          const onLeave = () => {
            state.pointer = false;
          };
          el.addEventListener("pointermove", onMove);
          el.addEventListener("pointerleave", onLeave);

          const tick = (time: number) => {
            // Idle drift over the stage when the pointer is away.
            if (!state.pointer || performance.now() - state.lastMove > 4000) {
              const c = stageCenter();
              const w = stage.offsetWidth * 0.32;
              const h = stage.offsetHeight * 0.26;
              target.x = c.x + Math.sin(time * 0.37) * w + Math.sin(time * 0.11) * 30;
              target.y = c.y + Math.sin(time * 0.53 + 1.3) * h + Math.cos(time * 0.17) * 18;
            }
            const k = state.pointer && performance.now() - state.lastMove < 4000 ? 0.16 : 0.035;
            pos.x += (target.x - pos.x) * k;
            pos.y += (target.y - pos.y) * k;

            // Blend toward the stage centre as the scroll opens the lens.
            const c = stageCenter();
            const p = state.p;
            const bx = pos.x + (c.x - pos.x) * p;
            const by = pos.y + (c.y - pos.y) * p;
            setX(bx);
            setY(by);

            const maxR = Math.hypot(el.offsetWidth, el.offsetHeight) * 0.62;
            const r = LENS_R + (maxR - LENS_R) * gsap.parseEase("power2.in")(p);
            setR(r);

            lens.current.x = bx;
            lens.current.y = by;
            lens.current.glow = 0.75 - p * 0.45;
          };
          gsap.ticker.add(tick);

          /* The scroll: pin the hero and open the lens. */
          const sw = window.innerWidth;
          const sh = window.innerHeight;
          const grow = () => {
            const b = stage.getBoundingClientRect();
            const sx = Math.min((sw - 48) / b.width, (sh - 120) / b.height);
            return Math.min(Math.max(sx, 1.02), 1.5);
          };
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "+=140%",
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
              onUpdate: (self) => {
                state.p = self.progress;
              },
            },
          });
          tl.to(copy, { y: -60, opacity: 0, duration: 0.45, ease: "power2.in" }, 0)
            .to(
              stages,
              {
                scale: grow,
                x: () => {
                  const b = stage.getBoundingClientRect();
                  const cx = b.left + b.width / 2;
                  return (sw / 2 - cx) / 1; // move stage centre to viewport centre
                },
                y: () => {
                  const b = stage.getBoundingClientRect();
                  const cy = b.top + b.height / 2;
                  return sh / 2 - cy + 16;
                },
                duration: 1,
                ease: "power2.inOut",
              },
              0,
            )
            .fromTo(
              evidenceBits,
              { y: 10, opacity: 0.0 },
              { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" },
              0.35,
            )
            .to(ring.current, { opacity: 0, duration: 0.25 }, 0.72)
            .fromTo(caption, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3 }, 0.78);

          return () => {
            el.removeEventListener("pointermove", onMove);
            el.removeEventListener("pointerleave", onLeave);
            gsap.ticker.remove(tick);
          };
        },
      );

      /* Reduced motion or touch: no pin, the stage simply shows the evidence,
         and the switch below the stage flips between the two. */
      mm.add("(max-width: 1023px), (pointer: coarse), (prefers-reduced-motion: reduce)", () => {
        el.style.setProperty("--lens-r", "0px");
        gsap.set(el.querySelectorAll("[data-ev]"), { opacity: 1, y: 0 });
        gsap.set(el.querySelectorAll("[data-copy-col], [data-stage]"), { clearProps: "all" });
      });

      return () => ScrollTrigger.refresh();
    },
    { scope: root },
  );

  // Mobile and keyboard: toggle the evidence layer with an expanding circle
  // from the switch itself.
  const [flipped, setFlipped] = useState(false);
  const flip = () => {
    const el = root.current;
    if (!el) return;
    const next = !flipped;
    setFlipped(next);
    const stage = el.querySelector<HTMLElement>("[data-stage]");
    if (!stage) return;
    const a = el.getBoundingClientRect();
    const b = stage.getBoundingClientRect();
    el.style.setProperty("--lens-x", `${b.left - a.left + b.width / 2}px`);
    el.style.setProperty("--lens-y", `${b.top - a.top + b.height}px`);
    gsap.to(el, {
      "--lens-r": next ? `${Math.hypot(a.width, a.height)}px` : "0px",
      duration: 0.8,
      ease: next ? "power3.inOut" : "power3.in",
    });
  };

  return (
    <section
      ref={root}
      className="relative isolate min-h-[100svh] overflow-hidden bg-ground"
      style={
        {
          "--lens-x": "70%",
          "--lens-y": "55%",
          "--lens-r": `${LENS_R}px`,
        } as React.CSSProperties
      }
      aria-label="Introduction"
    >
      <ShaderField className="absolute inset-0 -z-10 h-full w-full" lensRef={lens} />

      {/* Surface */}
      <HeroLayer mode="surface" />

      {/* Evidence, revealed through the lens */}
      <div
        className="lens-layer"
        style={{ clipPath: "circle(var(--lens-r) at var(--lens-x) var(--lens-y))" }}
        aria-hidden="true"
      >
        <HeroLayer mode="evidence" />
      </div>

      {/* The lens itself */}
      <div
        ref={ring}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute z-20 rounded-full",
          interactive ? "block" : "hidden",
        )}
        style={{
          left: "calc(var(--lens-x) - var(--lens-r))",
          top: "calc(var(--lens-y) - var(--lens-r))",
          width: "calc(var(--lens-r) * 2)",
          height: "calc(var(--lens-r) * 2)",
          boxShadow:
            "inset 0 0 0 1.5px rgba(255,255,255,0.22), inset 0 0 0 3px rgba(229,72,77,0.10), inset 0 24px 60px rgba(255,255,255,0.05), 0 0 0 1px rgba(0,0,0,0.5), 0 30px 80px rgba(0,0,0,0.45)",
          background:
            "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.10), rgba(255,255,255,0.02) 38%, transparent 62%)",
        }}
      />

      {/* Switch: the live thing on phones and for keyboards */}
      <div className="frame pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-end pb-6">
        <button
          type="button"
          onClick={flip}
          aria-pressed={flipped}
          className={cn(
            "pointer-events-auto flex h-11 items-center gap-3 px-4 text-[14px] text-ink glass",
            interactive && "lg:hidden",
          )}
        >
          <span className={cn("transition-colors", flipped ? "text-ink-3" : "text-ink")}>Surface</span>
          <span className="relative h-5 w-9 bg-raised-2">
            <span
              className="absolute top-0.5 left-0.5 h-4 w-4 bg-ink transition-transform duration-300"
              style={{ transform: flipped ? "translateX(16px)" : "none" }}
            />
          </span>
          <span className={cn("transition-colors", flipped ? "text-redline-bright" : "text-ink-3")}>
            What Infiniview saw
          </span>
        </button>
      </div>

      {/* Caption shown once the lens has opened */}
      <div
        data-caption
        className="pointer-events-none absolute inset-x-0 bottom-7 z-30 flex justify-center opacity-0"
      >
        <span className="glass px-4 py-2 text-[14px] text-ink-2">
          What the agents found in a sample run · nothing here is real customer data
        </span>
      </div>
    </section>
  );
}

function HeroLayer({ mode }: { mode: "surface" | "evidence" }) {
  const ev = mode === "evidence";
  // The surface layer is in flow and gives the section its height; the
  // evidence layer sits on top of it, clipped by the lens.
  return (
    <div className={cn(ev ? "lens-layer bg-[#0a0608]" : "relative bg-transparent")}>
      <div className="frame grid h-full min-h-[100svh] grid-cols-12 items-end gap-x-6 pt-[calc(var(--nav-h)+40px)] pb-[104px] lg:items-center lg:pb-[72px]">
        {/* Copy column */}
        <div
          data-copy-col=""
          className="col-span-12 flex flex-col lg:col-span-6"
        >
          {ev ? (
            <div
              data-h1
              aria-hidden="true"
              className="t-display text-transparent"
              style={{ WebkitTextStroke: "1px rgba(236,238,241,0.45)" }}
            >
              Red-team every pull request.
            </div>
          ) : (
            <h1 data-h1 className="t-display text-ink">
              Red-team every pull request.
            </h1>
          )}
          <p data-copy className={cn("t-lead mt-8 max-w-[38ch]", ev ? "text-ink-3" : "text-ink-2")}>
            Your branch is built in an isolated sandbox, then AI agents attack it. Every finding comes with proof you can replay.
          </p>
          <div data-copy className="mt-9">
            {ev ? (
              <div className="h-12" />
            ) : (
              <WaitlistForm id="waitlist" />
            )}
            <p className="t-small mt-3 text-ink-3">Free during the beta. We invite in batches.</p>
          </div>
        </div>

        {/* Stage */}
        <div className="col-span-12 mt-12 lg:col-span-6 lg:mt-0">
          <div
            data-stage=""
            className="relative mx-auto w-full max-w-[720px] lg:ml-auto lg:aspect-[16/11]"
            style={{ willChange: "transform" }}
          >
            <PRStage mode={mode} />
          </div>
        </div>
      </div>
    </div>
  );
}
