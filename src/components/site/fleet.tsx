"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Four kinds of agent. Each is a full-bleed band: the kind, its count, and
 * the roster of what it does running past. Hovering a band brings it forward;
 * the roster's speed answers the page's scroll velocity.
 */

const KINDS = [
  {
    name: "Code review",
    count: "4",
    unit: "agents in parallel",
    body: "Each reads the whole diff with one job: logic, performance, type safety, or style.",
    roster: ["logic errors", "race conditions", "N+1 queries", "unsafe casts", "dead branches", "error handling", "type narrowing", "naming"],
  },
  {
    name: "Static analysis",
    count: "26",
    unit: "scanners",
    body: "SAST, dependency audit, secrets, and infrastructure as code across JavaScript, TypeScript, Python, Go, Ruby, Java, PHP, and Rust.",
    roster: ["SAST", "dependency audit", "leaked secrets", "IaC misconfig", "taint tracking", "crypto misuse", "license check", "container config"],
  },
  {
    name: "Runtime attack",
    count: "12",
    unit: "attack agents",
    body: "They hit the running sandbox the way an attacker would, and keep the request that worked.",
    roster: ["injection", "auth bypass", "SSRF", "session hijacking", "CORS", "API fuzzing", "rate limits", "file upload", "crypto audit", "business logic", "prompt injection"],
  },
  {
    name: "Interaction testing",
    count: "7",
    unit: "test types",
    body: "Computer-vision agents fill forms, click through flows, and find the states no static tool can reach.",
    roster: ["UI crawl", "auth flows", "form abuse", "XSS payloads", "multi-tab races", "broken states", "navigation"],
  },
];

export function Fleet() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // Scroll velocity nudges the rosters: faster scrolling, faster roster.
        const tracks = gsap.utils.toArray<HTMLElement>(".roster-track", el);
        let last = window.scrollY;
        let lastT = performance.now();
        const vel = { v: 0 };
        const tick = () => {
          const now = performance.now();
          const dt = Math.max(16, now - lastT);
          const y = window.scrollY;
          const inst = Math.min(Math.abs(y - last) / dt, 3);
          vel.v += (inst - vel.v) * 0.12;
          last = y;
          lastT = now;
          const rate = 1 + vel.v * 2.2;
          tracks.forEach((t) => t.getAnimations().forEach((a) => (a.playbackRate = rate)));
        };
        gsap.ticker.add(tick);
        return () => gsap.ticker.remove(tick);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="agents" className="bg-ground py-24 md:py-32" aria-labelledby="agents-h">
      <div className="frame grid grid-cols-12 gap-x-6 gap-y-6">
        <h2 id="agents-h" className="t-head col-span-12 max-w-[16ch] text-ink lg:col-span-7" data-reveal="lines">
          Four kinds of agent. One run.
        </h2>
        <p className="t-body col-span-12 max-w-[42ch] self-end text-ink-2 lg:col-span-4 lg:col-start-9" data-reveal>
          Static analysis, runtime attacks, interaction testing, and code review are separate tools everywhere else. Here they share a sandbox, a code graph, and a report.
        </p>
      </div>

      <div className="mt-16 md:mt-24">
        {KINDS.map((k, i) => (
          <article
            key={k.name}
            className={cn(
              "group relative transition-colors duration-500",
              i % 2 === 0 ? "bg-ground" : "bg-ground-2",
              "hover:bg-surface",
            )}
          >
            <div className="frame grid grid-cols-12 items-center gap-x-6 gap-y-4 py-10 md:py-12">
              <div className="col-span-12 md:col-span-4">
                <h3 className="t-lead text-ink">{k.name}</h3>
              </div>
              <div className="col-span-12 flex items-baseline gap-3 md:col-span-3">
                <span className="text-[clamp(3rem,6vw,5.5rem)] leading-none font-medium tracking-[-0.04em] text-ink tabular-nums">
                  {k.count}
                </span>
                <span className="t-body text-ink-3">{k.unit}</span>
              </div>
              <p className="t-body col-span-12 max-w-[40ch] text-ink-2 md:col-span-5">{k.body}</p>
            </div>
            <div className="roster relative overflow-hidden pb-7" aria-hidden="true">
              <div
                className="roster-track text-[15px] text-ink-3 group-hover:text-ink"
                style={{ ["--roster-duration" as string]: `${28 + k.roster.join("").length * 0.35}s` }}
              >
                {[0, 1].map((n) => (
                  <ul key={n} className="flex shrink-0 items-center">
                    {k.roster.map((r) => (
                      <li key={`${n}-${r}`} className="flex items-center">
                        <span className="px-6">{r}</span>
                        <span className="h-1 w-1 bg-redline" />
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
