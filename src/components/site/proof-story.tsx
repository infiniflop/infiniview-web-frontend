"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Proof, not alerts. A finding, as the product renders it, stays pinned while
 * three statements scroll past; each statement brings its part of the
 * finding forward: the attack path, the evidence, the fix. Content is the
 * same fictional sample run the demo dashboard uses.
 */

const STEPS = [
  {
    key: "path",
    title: "Every finding is an exploit the agents actually ran.",
    body: "Static tools flag what might be wrong. Infiniview deploys the branch, sends the request, and reports what happened.",
  },
  {
    key: "evidence",
    title: "The evidence comes attached.",
    body: "The request, the response, the rows that came back. Screenshots and console logs for anything found in the browser.",
  },
  {
    key: "fix",
    title: "And the fix is written for your code.",
    body: "Not a link to a CWE page. A change you can apply, with the other files that share the root cause.",
  },
] as const;

export function ProofStory() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add({ desk: "(min-width: 1024px)", ok: MOTION_OK }, (ctx) => {
        const { desk, ok } = ctx.conditions as { desk: boolean; ok: boolean };
        const panel = el.querySelector<HTMLElement>("[data-panel]")!;
        const parts = {
          path: el.querySelector<HTMLElement>("[data-part='path']")!,
          evidence: el.querySelector<HTMLElement>("[data-part='evidence']")!,
          fix: el.querySelector<HTMLElement>("[data-part='fix']")!,
        };
        const steps = gsap.utils.toArray<HTMLElement>("[data-step]", el);

        const focus = (key: keyof typeof parts) => {
          (Object.keys(parts) as (keyof typeof parts)[]).forEach((k) => {
            const on = k === key;
            gsap.to(parts[k], {
              opacity: on ? 1 : 0.32,
              duration: ok ? 0.5 : 0,
              ease: "power2.out",
              overwrite: "auto",
            });
            parts[k].toggleAttribute("data-on", on);
          });
          steps.forEach((s) => s.toggleAttribute("data-on", s.dataset.step === key));
        };

        if (!desk) {
          // Stacked: each step is followed by its part of the finding; no pin.
          (Object.values(parts) as HTMLElement[]).forEach((p) => gsap.set(p, { opacity: 1 }));
          steps.forEach((s) => s.setAttribute("data-on", ""));
          return;
        }

        // Pin the panel for the length of the statements column.
        const stepsCol = el.querySelector<HTMLElement>("[data-steps]")!;
        const st = gsap.context(() => {
          gsap.timeline({
            scrollTrigger: {
              trigger: stepsCol,
              start: "top 20%",
              end: "bottom 80%",
              pin: panel,
              pinSpacing: false,
            },
          });
          steps.forEach((s) => {
            gsap.timeline({
              scrollTrigger: {
                trigger: s,
                start: "top 60%",
                end: "bottom 40%",
                onEnter: () => focus(s.dataset.step as keyof typeof parts),
                onEnterBack: () => focus(s.dataset.step as keyof typeof parts),
              },
            });
          });
        });
        focus("path");
        return () => st.revert();
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="proof" className="relative bg-ground py-24 md:py-32" aria-labelledby="proof-h">
      <div className="frame">
        <h2 id="proof-h" className="t-head max-w-[14ch] text-ink" data-reveal="lines">
          Proof, not alerts.
        </h2>

        <div className="mt-16 grid grid-cols-12 gap-x-6 gap-y-10 md:mt-24">
          {/* Statements */}
          <div data-steps className="col-span-12 lg:col-span-5">
            {STEPS.map((s, i) => (
              <div
                key={s.key}
                data-step={s.key}
                className={cn(
                  "group flex min-h-[40vh] flex-col justify-center py-10 transition-opacity duration-500 lg:min-h-[62vh] lg:py-0",
                  "data-on:opacity-100 opacity-40",
                )}
              >
                <p className="t-lead max-w-[26ch] text-ink">{s.title}</p>
                <p className="t-body mt-4 max-w-[42ch] text-ink-2">{s.body}</p>
                {/* On small screens the part follows its statement */}
                <div className="mt-8 lg:hidden">
                  <FindingPart part={s.key} standalone />
                </div>
                {i < STEPS.length - 1 && <div className="h-0" />}
              </div>
            ))}
          </div>

          {/* The finding */}
          <div className="col-span-12 hidden lg:col-span-7 lg:block">
            <div data-panel className="pt-4">
              <Finding />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Finding() {
  return (
    <div data-ui className="plate text-[13px] leading-[1.45] text-ink-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 pt-5">
        <span className="inline-flex h-6 items-center bg-redline px-2 text-[12px] font-semibold uppercase tracking-[0.02em] text-ground">
          Critical
        </span>
        <h3 className="text-[18px] font-medium tracking-[-0.01em] text-ink">SQL injection in admin search filter</h3>
        <span className="ml-auto evidence text-ink-3">confidence 92 · verified</span>
      </div>
      <div className="evidence mt-2 flex flex-wrap gap-x-5 gap-y-1 px-6 text-ink-3">
        <span>acme/payments-api</span>
        <span>feat/refund-flow</span>
        <span>services/admin/search.ts:87–94</span>
        <span>sql.injection.taint</span>
      </div>

      <div className="mt-5 flex flex-col gap-3 px-6 pb-6">
        <FindingPart part="path" />
        <FindingPart part="evidence" />
        <FindingPart part="fix" />
      </div>
    </div>
  );
}

function FindingPart({ part, standalone = false }: { part: "path" | "evidence" | "fix"; standalone?: boolean }) {
  const shell = cn(
    "bg-raised/80 px-5 py-4 transition-colors",
    standalone && "plate",
  );
  if (part === "path") {
    return (
      <div data-part={standalone ? undefined : "path"} className={shell} data-ui={standalone ? "" : undefined}>
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-medium text-ink">Attack path</span>
          <span className="evidence text-redline-bright">1 of 1 steps verified at runtime</span>
        </div>
        <ol className="mt-3 flex flex-col gap-2">
          {[
            "Authenticated low-privilege admin requests /admin/search?q=…",
            "q is concatenated into WHERE name LIKE '%<q>%'.",
            "Payload %' OR 1=1 -- returns the full users table.",
            "UNION-based payload exfiltrates email and password_hash.",
          ].map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="evidence w-4 shrink-0 pt-[2px] text-ink-4">{i + 1}</span>
              <span className={cn(i >= 2 ? "text-ink" : "text-ink-2")}>{s}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  if (part === "evidence") {
    return (
      <div data-part={standalone ? undefined : "evidence"} className={shell} data-ui={standalone ? "" : undefined}>
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-medium text-ink">Evidence</span>
          <span className="evidence text-ink-3">2 requests · replayable</span>
        </div>
        <div className="evidence mt-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-ground/70 px-3 py-2 text-ink">
            <span className="text-ink-3">GET</span>
            <span className="break-all">/admin/search?q=%25%27%20OR%201%3D1%20--%20</span>
            <span className="ml-auto text-mint">200</span>
            <span className="text-ink-3">4,812 rows</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-ground/70 px-3 py-2 text-ink">
            <span className="text-ink-3">GET</span>
            <span className="break-all">/admin/search?q=%25&apos; UNION SELECT email,password_hash,NULL FROM users --</span>
            <span className="ml-auto text-mint">200</span>
            <span className="text-redline-bright">credentials echoed</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div data-part={standalone ? undefined : "fix"} className={shell} data-ui={standalone ? "" : undefined}>
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-ink">Suggested fix</span>
        <span className="evidence text-ink-3">also fixes lib/db/query.ts</span>
      </div>
      <p className="mt-2 text-ink-2">
        Use parameterized queries; never interpolate request input into SQL. Add an allowlist for sortable columns.
      </p>
      <div className="evidence mt-3 flex flex-col bg-ground/70 px-3 py-2">
        <span className="text-redline-bright">− const rows = await db.raw(`… WHERE name LIKE &apos;%${"{q}"}%&apos;`);</span>
        <span className="text-mint">+ const rows = await db.query(&apos;… WHERE name LIKE ?&apos;, [`%${"{q}"}%`]);</span>
      </div>
    </div>
  );
}
