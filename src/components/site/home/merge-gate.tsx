"use client";

// The pull request side of a run: a review comment, the check while it runs,
// and the verdict. Critical and high block the merge (per the docs); the
// findings listed are the demo workspace's.

import { useRef, useState } from "react";
import { GitPullRequest, Lock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PHASES, SAMPLE_RUN, TRIGGERS } from "../content";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "../motion/gsap";
import { SplitHeading } from "../motion/split-heading";

const BLOCKING = [
  { sev: "Critical", title: "Refund endpoint lacks idempotency key", file: "services/refund/handler.ts:142" },
  { sev: "Critical", title: "SQL injection in admin search filter", file: "services/admin/search.ts:87" },
  { sev: "High", title: "Missing rate limit on /v1/refund", file: "routes/refund.ts:18" },
];

export function MergeGate() {
  const root = useRef<HTMLElement>(null);
  const [step, setStep] = useState<"idle" | "running" | "done">("idle");
  const [phase, setPhase] = useState(0);

  useGSAP(
    () => {
      const ui = root.current!.querySelector("[data-pr]")!;
      const play = () => {
        if (prefersReducedMotion()) {
          setStep("done");
          return;
        }
        const tl = gsap.timeline();
        tl.from(ui.querySelectorAll("[data-pr-in]"), { y: 24, opacity: 0, stagger: 0.12, duration: 0.8 });
        tl.call(() => setStep("running"), [], 0.5);
        PHASES.forEach((_, i) => tl.call(() => setPhase(i), [], 0.6 + i * 0.32));
        tl.call(() => setStep("done"), [], 0.6 + PHASES.length * 0.32);
      };
      ScrollTrigger.create({ trigger: ui, start: "top 75%", once: true, onEnter: play });
    },
    { scope: root },
  );

  const c = SAMPLE_RUN.counts;

  return (
    <section ref={root} id="merge" className="relative z-10 bg-void" aria-labelledby="merge-title">
      <div className="frame section-gap grid grid-cols-1 gap-y-14 lg:grid-cols-12 lg:gap-x-8">
        <SplitHeading id="merge-title" className="t-h2 lg:col-span-10">
          Critical findings block the merge.
        </SplitHeading>
        <div className="lg:col-span-5">
          <p data-reveal className="t-lead max-w-[32ch]">
            On pull requests, Infiniview posts a check. Critical and high findings block the merge. Medium, low and
            info are reported without stopping you.
          </p>
          <dl className="mt-12 flex flex-col gap-6">
            {TRIGGERS.map((t) => (
              <div key={t.how} data-reveal className="max-w-[44ch]">
                <dt className="text-[1.25rem] font-[640] tracking-[-0.015em] [font-variation-settings:'wdth'_108]">
                  {t.how}
                </dt>
                <dd className="mt-1 text-ink-2">{t.detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Pull request fragment */}
        <div data-pr data-ui className="flex flex-col gap-3 text-[1.0625rem] lg:col-span-6 lg:col-start-7" aria-label="Example pull request">
          <div data-pr-in className="flex items-center gap-3 text-ink-2">
            <GitPullRequest size={18} className="text-pass" aria-hidden />
            <span className="text-ink">feat/refund-flow</span>
            <span>into main</span>
            <span className="ml-auto tabular">#{SAMPLE_RUN.pr}</span>
          </div>

          <div data-pr-in className="rounded-[4px] bg-void-3 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/10 text-[0.875rem] font-[650]" aria-hidden>
                YO
              </span>
              <span className="font-[600]">you</span>
              <span className="text-ink-3">commented just now</span>
            </div>
            <p className="mt-3">
              <code className="t-code rounded-[2px] bg-ink/[0.08] px-1.5 py-0.5 text-[0.875rem] text-ink">@infiniview review</code>
            </p>
          </div>

          <div data-pr-in className="overflow-hidden rounded-[4px] bg-void-3">
            <div className="flex items-center gap-3 p-5">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-500",
                  step === "done" ? "bg-flare text-graphite" : "bg-ink/10 text-ink",
                )}
                aria-hidden
              >
                {step === "done" ? <X size={17} strokeWidth={2.6} /> : <span className="status-spinner !h-3 !w-3" />}
              </span>
              <div className="min-w-0">
                <p className="font-[600]">Infiniview / security review</p>
                <p className="truncate text-ink-2" aria-live="polite">
                  {step === "done"
                    ? `${c.critical} critical, ${c.high} high. Changes need attention.`
                    : step === "running"
                      ? `Running: ${PHASES[phase].name}`
                      : "Queued"}
                </p>
              </div>
              <span className="ml-auto shrink-0 tabular text-ink-3">{step === "done" ? `${SAMPLE_RUN.minutes}m` : ""}</span>
            </div>

            <div
              className="grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ gridTemplateRows: step === "done" ? "1fr" : "0fr" }}
            >
            <ul className={cn("overflow-hidden transition-opacity duration-500", step === "done" ? "opacity-100" : "opacity-0")}>
              {BLOCKING.map((b) => (
                <li key={b.title} className="grid grid-cols-[76px_1fr] gap-x-3 gap-y-0.5 bg-ink/[0.025] px-5 py-3 odd:bg-ink/[0.045]">
                  <span className={b.sev === "Critical" ? "font-[600] text-flare-soft" : "font-[600] text-sev-high"}>{b.sev}</span>
                  <span className="text-ink">{b.title}</span>
                  <code className="col-start-2 t-code text-ink-3">{b.file}</code>
                </li>
              ))}
              <li className="px-5 py-3 text-ink-3">
                + {c.high - 1} high, {c.medium} medium and {c.low} low in the full report
              </li>
            </ul>
            </div>
          </div>

          <div
            data-pr-in
            className={cn(
              "flex flex-wrap items-center gap-4 rounded-[4px] p-5 transition-colors duration-500",
              step === "done" ? "bg-flare/[0.12]" : "bg-void-3",
            )}
          >
            <Lock size={18} className={step === "done" ? "text-flare-soft" : "text-ink-3"} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-[600]">{step === "done" ? "Merging is blocked" : "Waiting for checks"}</p>
              <p className="text-ink-2">
                {step === "done"
                  ? "Resolve critical and high findings to merge."
                  : "Required check: Infiniview / security review"}
              </p>
            </div>
            <span className="cursor-not-allowed rounded-[3px] bg-ink/[0.08] px-4 py-2.5 font-[600] text-ink-3">
              Merge pull request
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
