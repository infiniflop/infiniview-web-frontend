"use client";

// Proof, not alerts: three real-shaped findings from the demo workspace,
// laid out as the report an engineer receives. Same sample data as /preview.

import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { MOCK_FINDINGS, type MockFinding } from "@/components/preview/mock-data";
import { gsap, useGSAP, prefersReducedMotion } from "../motion/gsap";
import { SplitHeading } from "../motion/split-heading";

const SHOWN = ["fd_01", "fd_02", "fd_13"]
  .map((id) => MOCK_FINDINGS.find((f) => f.id === id))
  .filter((f): f is MockFinding => !!f);

const REPO: Record<string, string> = { rv_01: "acme/payments-api", rv_04: "acme/admin-api" };

const EXPLOIT: Record<MockFinding["exploitability"], string> = {
  verified: "Verified at runtime",
  unverified: "Unverified",
  not_tested: "Not tested",
};

const SOURCE: Record<string, string> = {
  "runtime-attack": "Runtime attack agent",
  "static-analysis": "Static analysis",
};

export function Proof() {
  const [index, setIndex] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const f = SHOWN[index];

  useGSAP(
    () => {
      if (!panel.current || prefersReducedMotion()) return;
      gsap.fromTo(
        panel.current.querySelectorAll("[data-doc]"),
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.045, ease: "iv", overwrite: true },
      );
    },
    { dependencies: [index], scope: panel },
  );

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    const next = (index + dir + SHOWN.length) % SHOWN.length;
    setIndex(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="proof" className="relative z-10 bg-bone text-graphite" aria-labelledby="proof-title">
      <div className="frame section-gap">
        <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-12">
          <SplitHeading id="proof-title" className="t-h2 lg:col-span-7">
            Proof, not alerts.
          </SplitHeading>
          <p data-reveal className="t-lead max-w-[34ch] lg:col-span-5 lg:col-start-8 lg:self-end">
            A finding arrives with what an engineer needs to act on it: where it lives, how it was exploited, the
            evidence, and the fix.
          </p>
        </div>

        <div className="mt-[clamp(56px,7vw,110px)] grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Finding list */}
          <div
            role="tablist"
            aria-label="Sample findings"
            aria-orientation="vertical"
            className="flex flex-col gap-2 lg:col-span-4"
            onKeyDown={onKey}
            data-reveal
          >
            {SHOWN.map((item, i) => {
              const on = i === index;
              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  role="tab"
                  id={`tab-${item.id}`}
                  aria-selected={on}
                  aria-controls="proof-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-[3px] p-5 text-left transition-colors duration-300",
                    on ? "bg-graphite text-bone" : "bg-bone-2 text-graphite hover:bg-bone-3",
                  )}
                >
                  <span className="flex items-center gap-2.5 text-[0.875rem]">
                    <span className={cn("h-2 w-2 rounded-full", item.severity === "critical" ? "bg-flare" : "bg-sev-high")} />
                    <span className="font-[600] capitalize">{item.severity}</span>
                    <span className={on ? "text-bone/60" : "text-graphite-2"}>{item.category}</span>
                  </span>
                  <span className="mt-2.5 block text-[1.25rem] font-[620] leading-snug tracking-[-0.015em] [font-variation-settings:'wdth'_106]">
                    {item.title}
                  </span>
                  <code className={cn("t-code mt-2 block truncate", on ? "text-bone/60" : "text-graphite-2")}>
                    {item.primaryFile}:{item.lineStart}
                  </code>
                </button>
              );
            })}
            <p className="mt-3 px-1 text-[0.875rem] text-graphite-2">
              Sample findings from the demo workspace. The same data fills the{" "}
              <a href="/preview" className="underline decoration-graphite/30 underline-offset-4 hover:decoration-graphite">
                live demo
              </a>
              .
            </p>
          </div>

          {/* The report */}
          <div
            ref={panel}
            id="proof-panel"
            role="tabpanel"
            aria-labelledby={`tab-${f.id}`}
            data-reveal
            className="min-w-0 rounded-[3px] bg-[#f0f0ee] p-[clamp(22px,3vw,48px)] lg:col-span-8"
          >
            <div data-doc data-ui className="flex flex-wrap items-center gap-2 text-[0.875rem]">
              <span className="rounded-[2px] bg-flare px-2 py-0.5 font-[650] capitalize text-graphite">{f.severity}</span>
              <span className="rounded-[2px] bg-graphite px-2 py-0.5 font-[550] text-bone">{EXPLOIT[f.exploitability]}</span>
              <span className="rounded-[2px] bg-bone-2 px-2 py-0.5 capitalize">{f.delta}</span>
              <span className="rounded-[2px] bg-bone-2 px-2 py-0.5 tabular">{f.confidence}% confidence</span>
              <span className="ml-auto text-graphite-2">
                {REPO[f.reviewId]} · {SOURCE[f.sourcePhase ?? ""] ?? f.scanner}
              </span>
            </div>

            <h3 data-doc className="t-h3 mt-6 max-w-[26ch]">
              {f.title}
            </h3>
            <p data-doc className="mt-3 text-graphite-2">
              <code className="t-code">
                {f.primaryFile}:{f.lineStart}–{f.lineEnd}
              </code>
              <span className="mx-2" aria-hidden>
                ·
              </span>
              <code className="t-code">{f.ruleId}</code>
            </p>
            <p data-doc className="mt-5 max-w-[68ch]">
              {f.description}
            </p>

            <div className="mt-9 grid gap-9 md:grid-cols-2">
              <div data-doc>
                <h4 className="text-[1.0625rem] font-[650]">Attack path</h4>
                <ol className="mt-3 flex flex-col gap-3">
                  {f.attackPath?.map((step, i) => (
                    <li key={i} className="grid grid-cols-[22px_1fr] gap-2 text-[1.0625rem] leading-snug">
                      <span className="tabular pt-px text-graphite-2" aria-hidden>
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div data-doc>
                <h4 className="text-[1.0625rem] font-[650]">Evidence</h4>
                <ul className="mt-3 flex flex-col gap-3">
                  {f.evidence?.map((e, i) => (
                    <li key={i} className="grid grid-cols-[22px_1fr] gap-2 text-[1.0625rem] leading-snug">
                      <span className="mt-[0.45em] h-1.5 w-1.5 bg-flare" aria-hidden />
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div data-doc className="mt-9">
              <h4 className="text-[1.0625rem] font-[650]">Proof of concept</h4>
              <pre className="t-code mt-3 overflow-x-auto rounded-[3px] bg-graphite p-5 text-[0.875rem] text-bone" data-lenis-prevent>
                <code>{f.poc}</code>
              </pre>
            </div>

            <div data-doc className="mt-9 grid gap-2 md:grid-cols-[140px_1fr]">
              <h4 className="text-[1.0625rem] font-[650]">Suggested fix</h4>
              <p className="max-w-[64ch]">{f.suggestedFix}</p>
            </div>
            <div data-doc className="mt-5 grid gap-2 md:grid-cols-[140px_1fr]">
              <h4 className="text-[1.0625rem] font-[650]">Affected files</h4>
              <p className="flex flex-wrap gap-x-4 gap-y-1 text-graphite-2">
                {f.affectedFiles?.map((a) => (
                  <code key={a} className="t-code">
                    {a}
                  </code>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
