"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Static tools read your code. Infiniview attacks it. Five plain sentences,
 * each a full row; the open one shows its consequence and a small true
 * fragment. Click, Space, and Enter all work.
 */

const CLAIMS = [
  {
    s: "Your code never leaves the sandbox.",
    c: "Cloned, built, attacked, destroyed. Findings, proof bundles, and run metadata persist so you can review them. Source does not.",
    frag: ["clone", "build", "attack", "destroy"],
  },
  {
    s: "There is nothing to configure.",
    c: "No OpenAPI specs, no YAML, no test scripts. The agents map the attack surface of the running app and write their own plans.",
    frag: ["42 routes discovered", "11 forms", "3 auth roles", "0 config files"],
  },
  {
    s: "It finds chains, not just points.",
    c: "Attack-path analysis follows one weak input through the code graph to the data it exposes, and reports the chain as one finding.",
    frag: ["req.query.q", "db.raw(...)", "users.password_hash", "credential exfiltration"],
  },
  {
    s: "It learns your codebase.",
    c: "Every run tunes to your patterns: less noise on the next one, stronger evidence for what remains.",
    frag: ["run 1 · 31 signals", "run 2 · 19 signals", "3 findings · 3 verified"],
  },
  {
    s: "The report reads in an audit.",
    c: "Export compliance reports for SOC 2, ISO 27001, and internal reviews, with the proof attached.",
    frag: ["SOC 2", "ISO 27001", "internal audit", "PDF · JSON"],
  },
];

export function Claims() {
  const [open, setOpen] = useState(0);
  const root = useRef<HTMLElement>(null);

  return (
    <section ref={root} className="bg-ground-2 py-24 md:py-32" aria-labelledby="claims-h">
      <div className="frame">
        <h2 id="claims-h" className="t-head max-w-[14ch] text-ink" data-reveal="lines">
          Scanners read. Infiniview attacks.
        </h2>

        <ul className="mt-16 md:mt-24">
          {CLAIMS.map((c, i) => {
            const on = open === i;
            return (
              <li key={c.s} className={cn("transition-colors duration-400", on ? "bg-surface" : "bg-transparent hover:bg-ground")}>
                <button
                  type="button"
                  aria-expanded={on}
                  aria-controls={`claim-${i}`}
                  onClick={() => setOpen(on ? -1 : i)}
                  className="grid w-full grid-cols-12 items-start gap-x-6 px-[var(--page-x)] py-7 text-left md:py-9"
                  style={{ marginInline: "calc(var(--page-x) * -1)", width: "calc(100% + var(--page-x) * 2)" }}
                >
                  <span className={cn("col-span-11 text-[clamp(1.5rem,1rem+2.4vw,3rem)] leading-[1.05] tracking-[-0.025em] font-medium transition-colors", on ? "text-ink" : "text-ink-2")}>
                    {c.s}
                  </span>
                  <span className="col-span-1 flex justify-end pt-2 text-ink-3">
                    <span className={cn("faq-plus transition-transform duration-300", on && "rotate-45")} />
                  </span>
                </button>
                <div
                  id={`claim-${i}`}
                  className="grid transition-[grid-template-rows] duration-500"
                  style={{ gridTemplateRows: on ? "1fr" : "0fr", transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
                >
                  <div className="overflow-hidden">
                    <div className="grid grid-cols-12 gap-x-6 gap-y-6 pb-9 md:pb-12">
                      <p className="t-body col-span-12 max-w-[52ch] text-ink-2 md:col-span-6">{c.c}</p>
                      <div className="col-span-12 md:col-span-5 md:col-start-8">
                        <ol data-ui className="plate flex flex-wrap gap-x-5 gap-y-2 px-4 py-3">
                          {c.frag.map((f, j) => (
                            <li key={f} className="evidence flex items-center gap-2 text-ink">
                              {j > 0 && <span className="text-ink-4">→</span>}
                              <span className={cn(j === c.frag.length - 1 && i === 2 && "text-redline-bright")}>{f}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
