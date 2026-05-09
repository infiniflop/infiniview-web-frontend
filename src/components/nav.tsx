"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { num: "01", label: "how it works", href: "#how-it-works" },
  { num: "02", label: "arsenal", href: "#arsenal" },
  { num: "03", label: "features", href: "#features" },
  { num: "04", label: "faq", href: "#faq" },
];

export function Nav({ activePath }: { activePath?: string } = {}) {
  const homeHref = activePath ? "/" : "#top";

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg/82 backdrop-blur-[10px]">
      <div className="mx-auto flex max-w-[1440px] items-center gap-8 px-6 md:px-12 py-[18px]">
        <a href={homeHref} className="flex items-center gap-2.5">
          <div className="relative h-[22px] w-[22px] bg-lime">
            <div className="absolute inset-1 border-[1.5px] border-[#07080b]" />
          </div>
          <span className="text-[15px] font-bold tracking-[-0.02em]">
            INFINIVIEW<span className="text-lime">/</span>
          </span>
        </a>

        <div className="flex-1" />

        <div className="hidden lg:flex items-center gap-6 font-mono text-xs text-text-secondary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-lime"
            >
              <span className="text-text-muted">[{link.num}]</span> {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            href="/preview"
            prefetch={false}
            className="btn-ghost font-mono text-xs px-4 py-2.5 tracking-[0.02em] hidden sm:inline-flex"
          >
            VIEW DEMO →
          </Link>
          <button
            type="button"
            onClick={() => {
              const form = document.getElementById("waitlist");
              if (!form) return;
              form.scrollIntoView({ behavior: "smooth", block: "center" });
              const input = form.querySelector<HTMLInputElement>("input[type='email']");
              if (input) setTimeout(() => input.focus(), 600);
            }}
            className="btn-lime font-mono text-xs px-4 py-2.5 tracking-[0.02em]"
          >
            GET EARLY ACCESS →
          </button>
        </div>
      </div>
    </nav>
  );
}
