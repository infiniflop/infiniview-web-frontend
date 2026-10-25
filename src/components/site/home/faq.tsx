"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { CONTACT_EMAIL } from "../content";
import { SplitHeading } from "../motion/split-heading";

type QA = { q: string; a: string };

export function Faq({ items, title = "Questions, answered.", id = "faq" }: { items: QA[]; title?: string; id?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <section id={id} className="relative z-10 bg-void" aria-labelledby={`${id}-title`}>
      <div className="frame section-gap grid grid-cols-1 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SplitHeading id={`${id}-title`} className="t-h2 max-w-[9ch]">
              {title}
            </SplitHeading>
            <p data-reveal className="mt-8 max-w-[28ch] text-ink-2">
              Anything else goes to{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="link-draw text-ink">
                {CONTACT_EMAIL}
              </a>
              , and a person answers, usually the same day.
            </p>
          </div>
        </div>

        <ul className="flex flex-col gap-2 lg:col-span-7 lg:col-start-6">
          {items.map((item, i) => {
            const isOpen = open === i;
            const panelId = `${base}-p${i}`;
            const btnId = `${base}-b${i}`;
            return (
              <li key={item.q} data-reveal className={cn("rounded-[3px] transition-colors duration-300", isOpen ? "bg-void-3" : "bg-void-2 hover:bg-void-3")}>
                <h3>
                  <button
                    id={btnId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center gap-6 p-[clamp(20px,2.2vw,30px)] text-left"
                  >
                    <span className="flex-1 text-[1.25rem] font-[620] leading-snug tracking-[-0.018em] [font-variation-settings:'wdth'_106]">
                      {item.q}
                    </span>
                    <span className="relative h-4 w-4 shrink-0" aria-hidden>
                      <span className="absolute left-0 top-1/2 h-[2px] w-4 -translate-y-1/2 bg-ink" />
                      <span
                        className={cn(
                          "absolute left-1/2 top-0 h-4 w-[2px] -translate-x-1/2 bg-ink transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                          isOpen && "rotate-90 scale-y-0",
                        )}
                      />
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p
                      className={cn(
                        "max-w-[62ch] px-[clamp(20px,2.2vw,30px)] pb-[clamp(22px,2.4vw,32px)] text-ink-2 transition-opacity duration-500",
                        isOpen ? "opacity-100" : "opacity-0",
                      )}
                    >
                      {item.a}
                    </p>
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
