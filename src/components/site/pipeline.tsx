"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * One run, from pull request to proof. The sequence is shown as what you do
 * and what comes back: five true-size fragments threaded by one line that
 * draws itself as you scroll, and lights each station as it arrives.
 */

const STEPS = [
  {
    title: "You open a pull request, or ask for a run.",
    body: "Infiniview starts from a PR, from an @infiniview review comment, or from the dashboard.",
  },
  {
    title: "The branch is built and deployed in an isolated sandbox.",
    body: "Cloned, built, and run in a fresh environment with no path to production.",
  },
  {
    title: "Four kinds of agent go to work at once.",
    body: "Reviewers read the diff, scanners sweep the tree, attackers probe the running app, and testers drive it like a user.",
  },
  {
    title: "Signals become findings.",
    body: "Results are deduplicated, linked through the code graph, and paired with a fix before anything reaches you.",
  },
  {
    title: "Proof lands on the pull request. The sandbox is destroyed.",
    body: "Findings post to the PR and the dashboard with replayable proof bundles. Nothing of your code is kept.",
  },
];

export function Pipeline() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const line = el.querySelector<SVGLineElement>("[data-line]");
        const stations = gsap.utils.toArray<HTMLElement>("[data-station]", el);
        if (line) {
          gsap.fromTo(
            line,
            { drawSVG: "0%" },
            {
              drawSVG: "100%",
              ease: "none",
              scrollTrigger: { trigger: el.querySelector("[data-track]"), start: "top 55%", end: "bottom 60%", scrub: 0.5 },
            },
          );
        }
        stations.forEach((s) => {
          const dot = s.querySelector("[data-dot]");
          const frag = s.querySelector("[data-frag]");
          gsap.timeline({
            scrollTrigger: { trigger: s, start: "top 62%", once: true },
          })
            .fromTo(dot, { scale: 0.4, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }, 0)
            .fromTo(frag, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0.05)
            .add(() => s.setAttribute("data-on", ""), 0.1);
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        el.querySelectorAll("[data-station]").forEach((s) => s.setAttribute("data-on", ""));
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="how-it-works" className="relative bg-ground-2 py-24 md:py-32" aria-labelledby="hiw-h">
      <div className="frame">
        <div className="grid grid-cols-12 gap-x-6">
          <h2 id="hiw-h" className="t-head col-span-12 max-w-[16ch] text-ink lg:col-span-7" data-reveal="lines">
            One run, from pull request to proof.
          </h2>
          <p className="t-body col-span-12 mt-6 max-w-[40ch] self-end text-ink-2 lg:col-span-4 lg:col-start-9 lg:mt-0" data-reveal>
            There is nothing to configure. Connect the repository; the agents discover the attack surface and write their own plans.
          </p>
        </div>

        <div data-track className="relative mt-16 md:mt-24">
          {/* The thread */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-[11px] h-full w-[2px] lg:left-1/2 lg:-translate-x-1/2"
            viewBox="0 0 2 100"
            preserveAspectRatio="none"
          >
            <line x1="1" y1="0" x2="1" y2="100" stroke="var(--color-line)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <line data-line x1="1" y1="0" x2="1" y2="100" stroke="var(--color-ink)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>

          <ol className="flex flex-col gap-16 lg:gap-24">
            {STEPS.map((s, i) => {
              const left = i % 2 === 0;
              return (
                <li key={i} data-station className="group relative grid grid-cols-12 gap-x-6">
                  {/* dot */}
                  <span
                    data-dot
                    className="absolute top-2 left-[4px] z-10 block h-4 w-4 bg-ink lg:left-1/2 lg:-translate-x-1/2"
                    style={{ boxShadow: "0 0 0 6px var(--color-ground-2)" }}
                  />
                  <div
                    className={cn(
                      "col-span-12 pl-10 lg:col-span-5 lg:pl-0",
                      left ? "lg:col-start-1 lg:pr-10 lg:text-right" : "lg:col-start-8 lg:pl-10",
                    )}
                  >
                    <h3 className="t-lead max-w-[24ch] text-ink lg:max-w-none">{s.title}</h3>
                    <p className={cn("t-body mt-3 max-w-[40ch] text-ink-2", left && "lg:ml-auto")}>{s.body}</p>
                  </div>
                  <div
                    data-frag
                    className={cn(
                      "col-span-12 mt-6 pl-10 lg:col-span-5 lg:mt-0 lg:pl-0",
                      left ? "lg:col-start-8 lg:pl-10" : "lg:col-start-1 lg:row-start-1 lg:pr-10",
                    )}
                  >
                    <Fragment index={i} />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Fragment({ index }: { index: number }) {
  const base = "plate text-[13px] leading-[1.45] text-ink-2";
  switch (index) {
    case 0:
      return (
        <div data-ui className={cn(base, "p-5")}>
          <div className="flex items-center gap-2">
            <span className="inline-block h-5 w-5 rounded-full bg-raised-2" />
            <span className="text-ink">j.okafor</span>
            <span className="text-ink-4">commented 2 min ago</span>
          </div>
          <p className="mt-3 text-[15px] text-ink">
            <span className="bg-raised px-1 text-ink">@infiniview</span> review
          </p>
          <div className="mt-4 flex items-center gap-2 text-ink-3">
            <span className="inline-block h-5 w-5 rounded-full bg-redline" />
            <span className="text-ink">infiniview</span>
            <span className="text-ink-4">bot</span>
            <span className="ml-auto evidence">queued · run 2</span>
          </div>
        </div>
      );
    case 1:
      return (
        <div data-ui className={cn(base, "evidence p-5 text-ink-2")}>
          {[
            ["00:00.4", "clone", "acme/payments-api@feat/refund-flow"],
            ["00:12.9", "build", "pnpm install · pnpm build"],
            ["00:58.1", "deploy", "https://sandbox-7f3a.internal (isolated)"],
            ["01:02.6", "seed", "fixtures loaded · 3 roles"],
            ["01:03.0", "ready", "attack surface: 42 routes, 11 forms"],
          ].map(([t, k, v]) => (
            <div key={t} className="flex gap-4 py-0.5">
              <span className="w-14 shrink-0 text-ink-4">{t}</span>
              <span className={cn("w-14 shrink-0", k === "ready" ? "text-mint" : "text-ink-3")}>{k}</span>
              <span className="truncate text-ink">{v}</span>
            </div>
          ))}
        </div>
      );
    case 2:
      return (
        <div data-ui className={cn(base, "grid grid-cols-2 gap-px bg-line")}>
          {[
            ["Code review", "4 agents", "logic · performance · types · style"],
            ["Static analysis", "26 scanners", "SAST · dependencies · secrets · IaC"],
            ["Runtime attack", "12 agents", "injection · auth · SSRF · session"],
            ["Interaction", "7 test types", "forms · auth flows · XSS · races"],
          ].map(([a, b, c]) => (
            <div key={a} className="bg-surface p-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[14px] font-medium text-ink">{a}</span>
                <span className="evidence text-ink-3">{b}</span>
              </div>
              <div className="evidence mt-2 text-ink-3">{c}</div>
              <div className="mt-3 flex gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span
                    key={i}
                    className={cn("h-1 flex-1", i < 6 ? "bg-ink" : "bg-raised-2")}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    case 3:
      return (
        <div data-ui className={cn(base, "p-5")}>
          <div className="flex items-center justify-between">
            <span className="evidence text-ink-3">31 raw signals</span>
            <span className="evidence text-ink-3">→</span>
            <span className="evidence text-ink">3 findings</span>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {[
              ["Critical", "SQL injection in admin search filter", "verified"],
              ["High", "Missing rate limit on /v1/refund", "verified"],
              ["High", "Refund replay within settlement window", "verified"],
            ].map(([sev, t, v]) => (
              <div key={t} className="flex items-center gap-3 bg-raised/80 px-3 py-2">
                <span
                  className={cn(
                    "inline-flex h-5 items-center px-1.5 text-[11px] font-semibold uppercase",
                    sev === "Critical" ? "bg-redline text-ground" : "bg-raised-2 text-ink",
                  )}
                >
                  {sev}
                </span>
                <span className="truncate text-ink">{t}</span>
                <span className="evidence ml-auto shrink-0 text-ink-3">{v}</span>
              </div>
            ))}
          </div>
          <div className="evidence mt-3 text-ink-3">root cause: request input trusted without validation · 3 findings</div>
        </div>
      );
    default:
      return (
        <div data-ui className={cn(base, "p-5")}>
          <div className="flex items-center gap-2">
            <span className="inline-block h-5 w-5 rounded-full bg-redline" />
            <span className="text-ink">infiniview</span>
            <span className="text-ink-4">bot · 7 min ago</span>
          </div>
          <p className="mt-3 text-[15px] text-ink">
            Run complete: <span className="text-redline-bright">1 critical</span>, 2 high, 4 medium, 2 low. 18 of 24 interaction tests passed.
          </p>
          <p className="mt-2 text-ink-2">
            Proof bundles attached for all 3 verified exploits. Suggested fixes in the dashboard.
          </p>
          <div className="evidence mt-4 flex items-center justify-between text-ink-3">
            <span>sandbox-7f3a destroyed · 00:00 retained</span>
            <span className="text-ink">view run →</span>
          </div>
        </div>
      );
  }
}
