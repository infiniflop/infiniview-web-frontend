"use client";

// The live thing on the first screen: a sample run, played against the glass
// block. Every line comes from the demo workspace's sample review
// (acme/payments-api, feat/refund-flow), the same data /preview shows.

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { PHASES, SAMPLE_RUN } from "../content";
import { scene, IDLE } from "../scene/store";
import { gsap, useGSAP, prefersReducedMotion } from "../motion/gsap";

const OUTPUT = [
  "Fresh sandbox, settings frozen",
  "Routes and data flows mapped",
  "1 secret, 1 vulnerable dependency",
  "Attack path across two files",
  "Weak bcrypt cost in lib/auth",
  "Refund replayed 5×, paid out 5×",
  "Merge blocked: 2 critical, 3 high",
];

type State = "ready" | "running" | "done";

/** Registered so the scroll story can stop a run that's still playing. */
export const heroRun: { kill: () => void } = { kill: () => {} };

export function RunConsole({ className, autoStartDelay = 2.1 }: { className?: string; autoStartDelay?: number }) {
  const [state, setState] = useState<State>("ready");
  const [phase, setPhase] = useState(-1);
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const counts = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const reset = useCallback(() => {
    tl.current?.kill();
    tl.current = null;
  }, []);

  const run = useCallback(() => {
    reset();
    started.current = true;
    const reduced = prefersReducedMotion();
    const step = reduced ? 0.25 : 0.95;
    setState("running");
    setPhase(0);

    const t = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => setState("done"),
    });
    tl.current = t;

    // Back to a clean, sealed block before the run begins.
    t.to(scene, { findings: 0, paths: 0, extract: 0, scanOn: 0, graph: 0, spread: IDLE.spread, duration: 0.3 });

    PHASES.forEach((_, i) => t.call(() => setPhase(i), [], 0.3 + i * step));
    const at = (i: number) => 0.3 + i * step;

    // Graph build: sheets separate, edges appear
    t.to(scene, { spread: 0.75, graph: 1, duration: step }, at(1));
    // Scanning: one sweep, bottom to top
    t.set(scene, { scan: 0 }, at(2));
    t.to(scene, { scanOn: 1, duration: 0.15 }, at(2));
    t.to(scene, { scan: 1, duration: step, ease: "none" }, at(2));
    t.to(scene, { scanOn: 0, graph: 0.25, duration: 0.2 }, at(3) - 0.05);
    // Analysis: findings light, the path draws
    t.to(scene, { findings: 1, duration: step * 0.9, ease: "none" }, at(3));
    t.to(scene, { paths: 1, duration: step * 0.6 }, at(3) + step * 0.4);
    // Review: a closer look
    t.to(scene, { zoom: 0.35, spin: 0.35, duration: step }, at(4));
    // Testing: agents attack
    t.to(scene, { probes: 1, duration: step * 0.4 }, at(5));
    // Report: settle back
    t.to(scene, { zoom: 0, spin: 0, probes: IDLE.probes, spread: 0.4, duration: step * 1.2 }, at(6));
    if (counts.current && !reduced) {
      t.fromTo(
        counts.current.children,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.06, duration: 0.6, ease: "iv", immediateRender: false },
        at(6) + 0.1,
      );
    }
  }, [reset]);

  useEffect(() => {
    heroRun.kill = () => {
      if (tl.current) {
        tl.current.kill();
        tl.current = null;
        setState("done");
        setPhase(PHASES.length - 1);
      }
    };
    return () => {
      heroRun.kill = () => {};
      reset();
    };
  }, [reset]);

  // Play once on load so the scene shows what it does; the visitor can rerun it.
  useGSAP(() => {
    const id = gsap.delayedCall(autoStartDelay, () => {
      if (!started.current && window.scrollY < window.innerHeight * 0.5) run();
    });
    return () => id.kill();
  });

  const total = SAMPLE_RUN.counts;

  return (
    <div
      ref={root}
      data-ui
      className={cn("glass w-full max-w-[400px] rounded-[4px] p-4 text-[0.875rem]", className)}
      aria-label="Sample run"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-[600] text-ink [font-variation-settings:'wdth'_108]">Sample run</p>
          <p className="mt-0.5 text-ink-3">
            {SAMPLE_RUN.repo} · PR #{SAMPLE_RUN.pr}
          </p>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={state === "running"}
          className="btn btn-glass !h-9 !gap-1.5 !px-3 !text-[0.875rem] disabled:cursor-default disabled:opacity-60"
        >
          {state === "done" ? (
            <>
              <RotateCcw size={14} aria-hidden /> Run again
            </>
          ) : (
            <>
              <Play size={13} fill="currentColor" aria-hidden /> {state === "running" ? "Running" : "Run it"}
            </>
          )}
        </button>
      </div>

      {/* Seven segments, one per phase, the way the dashboard timeline reads */}
      <ol className="mt-4 grid grid-cols-7 gap-1" aria-label="Phases">
        {PHASES.map((p, i) => {
          const isDone = state === "done" || i < phase;
          const isNow = state === "running" && i === phase;
          return (
            <li key={p.name} title={p.name} className="h-[3px] overflow-hidden bg-ink/[0.12]">
              <span
                className={cn(
                  "block h-full origin-left transition-transform ease-[cubic-bezier(0.16,1,0.3,1)]",
                  isDone ? "scale-x-100 bg-ink-2 duration-300" : isNow ? "scale-x-100 bg-flare duration-[900ms]" : "scale-x-0 bg-flare duration-200",
                )}
              />
              <span className="sr-only">{p.name}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 flex min-h-[1.5em] items-baseline gap-2.5" aria-live="off">
        <span className="font-[600] text-ink">{phase < 0 ? "Ready" : PHASES[phase].name}</span>
        <span key={phase} className="console-line truncate text-ink-2">
          {phase < 0 ? "Press run to watch the block get attacked" : OUTPUT[phase]}
        </span>
      </p>

      <div
        ref={counts}
        className={cn("mt-3.5 grid grid-cols-4 gap-1 transition-opacity duration-300", state === "done" ? "opacity-100" : "opacity-40")}
      >
        {(
          [
            ["Critical", total.critical, "text-flare-soft"],
            ["High", total.high, "text-sev-high"],
            ["Medium", total.medium, "text-sev-medium"],
            ["Low", total.low, "text-sev-low"],
          ] as const
        ).map(([label, n, tone]) => (
          <div key={label} className="rounded-[2px] bg-ink/[0.05] px-2.5 py-1.5">
            <div className={cn("tabular text-[1.25rem] font-[650] leading-none", state === "done" ? tone : "text-ink-3")}>
              {state === "done" ? n : "–"}
            </div>
            <div className="mt-1 text-[0.875rem] text-ink-3">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
