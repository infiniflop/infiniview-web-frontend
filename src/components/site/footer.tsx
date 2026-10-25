"use client";

import Link from "next/link";
import { useRef } from "react";
import { CONTACT_EMAIL, DOCS_URL, SALES_EMAIL } from "./content";
import { Mark } from "./mark";
import { gsap, useGSAP, prefersReducedMotion } from "./motion/gsap";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Arsenal", href: "/#arsenal" },
      { label: "Proof", href: "/#proof" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Live demo", href: "/preview" },
      { label: "Documentation", href: DOCS_URL },
      { label: "Join the waitlist", href: "/#waitlist" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
      { label: SALES_EMAIL, href: `mailto:${SALES_EMAIL}` },
    ],
  },
];

export function Footer() {
  const root = useRef<HTMLElement>(null);

  // The name rises into place as the page ends.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-wordmark] span", {
        yPercent: 100,
        ease: "none",
        stagger: 0.04,
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: 0.6 },
      });
    },
    { scope: root },
  );

  return (
    <footer ref={root} className="relative z-10 overflow-hidden bg-void">
      <div className="frame pt-[clamp(80px,10vw,150px)]">
        <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Mark size={34} className="text-ink" />
            <p className="mt-6 max-w-[30ch] text-ink-2">
              AI agents that review, scan and attack every pull request inside a sealed sandbox.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7 lg:col-start-6" aria-label="Footer">
            {COLUMNS.map((c) => (
              <div key={c.title}>
                <h2 className="text-[1.0625rem] text-ink-3">{c.title}</h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} prefetch={false} className="link-draw break-all text-ink-2 transition-colors hover:text-ink">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <p
          data-wordmark
          aria-hidden
          className="mt-[clamp(72px,10vw,140px)] flex overflow-hidden whitespace-nowrap pb-[0.06em] text-[17.4vw] font-[780] leading-[0.78] tracking-[-0.06em] [font-variation-settings:'wdth'_125]"
        >
          {"Infiniview".split("").map((ch, i) => (
            <span key={i} className="inline-block">
              {ch}
            </span>
          ))}
        </p>
        <div className="flex flex-wrap justify-between gap-4 py-8 text-[0.875rem] text-ink-3">
          <span>© {new Date().getFullYear()} Infiniview. Built by Infiniflop Labs.</span>
          <span>Currently in early access.</span>
        </div>
      </div>
    </footer>
  );
}
