"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Faq = {
  q: string;
  a: string;
};

export function FAQAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="border-t border-border">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className="border-b border-border">
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="w-full bg-transparent border-0 text-text text-left py-[22px] px-1 cursor-pointer flex items-center gap-4"
            >
              <span className="font-mono text-[11px] text-text-muted w-[34px] shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[22px] font-bold tracking-[-0.025em] flex-1">{f.q}</span>
              <span
                className={cn(
                  "font-mono text-[18px] w-5 text-right",
                  isOpen ? "text-lime" : "text-text-muted",
                )}
              >
                {isOpen ? "-" : "+"}
              </span>
            </button>
            {isOpen && (
              <div className="px-1 pb-6 pl-[54px] text-[15px] leading-[1.65] text-text-secondary max-w-[720px]">
                {f.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
