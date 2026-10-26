"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { FAQS } from "@/lib/site/content";

export function Faq({
  items = FAQS,
  id = "faq",
  title = "Questions? Answers.",
}: {
  items?: readonly { q: string; a: string }[];
  id?: string;
  title?: string;
}) {
  const [open, setOpen] = useState(0);

  return (
    <section id={id} className="faq" aria-labelledby={`${id}-title`}>
      <div className="wrap faq-grid">
        <div className="faq-side">
          <h2 id={`${id}-title`} className="t-h2" data-split>
            {title}
          </h2>
          <p className="t-body faq-contact" data-reveal>
            <a className="link" href="mailto:hello@infiniflop.com">
              hello@infiniflop.com
            </a>{" "}
            gets a human, usually same day.
          </p>
        </div>

        <div className="faq-list glass glass--deep" data-reveal>
          {items.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="faq-item" data-open={isOpen}>
                <h3>
                  <button
                    type="button"
                    id={`${id}-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${id}-a-${i}`}
                    className="faq-q"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span>{f.q}</span>
                    <span className="faq-plus" aria-hidden>
                      <Plus size={20} strokeWidth={2.2} />
                    </span>
                  </button>
                </h3>
                <div id={`${id}-a-${i}`} className="faq-a">
                  <div>
                    <p className="t-body">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
