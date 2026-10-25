"use client";

import { useEffect, useRef } from "react";

export type Faq = { q: string; a: string };

/**
 * Questions. The heading stays while the tiles scroll past. Built on
 * <details> so it works without script; the shared name keeps one open.
 */
export function FAQ({ faqs, heading = "Questions.", id = "faq" }: { faqs: Faq[]; heading?: string; id?: string }) {
  const root = useRef<HTMLElement>(null);

  // Safari before 17 ignores `name` on <details>; close the others by hand.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const all = Array.from(el.querySelectorAll("details"));
    const onToggle = (e: Event) => {
      const d = e.currentTarget as HTMLDetailsElement;
      if (d.open) all.forEach((o) => o !== d && (o.open = false));
    };
    all.forEach((d) => d.addEventListener("toggle", onToggle));
    return () => all.forEach((d) => d.removeEventListener("toggle", onToggle));
  }, []);

  return (
    <section ref={root} id={id} className="faq bg-ground py-24 md:py-32" aria-labelledby={`${id}-h`}>
      <div className="frame grid grid-cols-12 gap-x-6 gap-y-12">
        <div className="col-span-12 lg:col-span-4">
          <h2 id={`${id}-h`} className="t-head text-ink lg:sticky lg:top-[112px]" data-reveal="lines">
            {heading}
          </h2>
        </div>
        <div className="col-span-12 flex flex-col gap-2 lg:col-span-8">
          {faqs.map((f, i) => (
            <details key={f.q} name={`${id}-group`} open={i === 0} className="group bg-surface open:bg-raised" data-reveal>
              <summary className="flex min-h-[72px] items-center gap-6 px-6 py-5">
                <span className="flex-1 text-[19px] font-medium leading-[1.25] tracking-[-0.01em] text-ink md:text-[21px]">
                  {f.q}
                </span>
                <span className="faq-plus text-ink-2" aria-hidden="true" />
              </summary>
              <div className="faq-body">
                <div>
                  <p className="t-body max-w-[58ch] px-6 pb-7 text-ink-2">{f.a}</p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
