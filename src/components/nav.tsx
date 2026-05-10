"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { num: "01", label: "how it works", href: "#how-it-works" },
  { num: "02", label: "arsenal", href: "#arsenal" },
  { num: "03", label: "features", href: "#features" },
  { num: "04", label: "faq", href: "#faq" },
];

export function Nav({ activePath, docsUrl }: { activePath?: string; docsUrl?: string } = {}) {
  const homeHref = activePath ? "/" : "#top";
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [mobileOpen]);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg/82 backdrop-blur-[10px]">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 sm:gap-8 px-6 md:px-12 py-[18px]">
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
          {docsUrl && (
            <a href={docsUrl} className="transition-colors hover:text-lime">
              <span className="text-text-muted">[05]</span> docs
            </a>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <div className="hidden sm:contents">
            <Link
              href="/preview"
              prefetch={false}
              className="btn-ghost font-mono text-xs px-4 py-2.5 tracking-[0.02em] items-center gap-1.5 whitespace-nowrap"
            >
              DEMO <ArrowRight size={13} strokeWidth={2.5} />
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
              className="btn-lime font-mono text-xs px-4 py-2.5 tracking-[0.02em] items-center gap-1.5 whitespace-nowrap"
            >
              EARLY ACCESS <ArrowRight size={13} strokeWidth={2.5} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex items-center justify-center w-10 h-10 text-text-secondary hover:text-text transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-bg/95 backdrop-blur-[10px]">
          <div className="mx-auto max-w-[1440px] px-6 py-6 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-mono text-sm text-text-secondary transition-colors hover:text-lime py-2"
              >
                <span className="text-text-muted">[{link.num}]</span> {link.label}
              </a>
            ))}
            {docsUrl && (
              <a
                href={docsUrl}
                onClick={() => setMobileOpen(false)}
                className="font-mono text-sm text-text-secondary transition-colors hover:text-lime py-2"
              >
                <span className="text-text-muted">[05]</span> docs
              </a>
            )}
            <div className="flex flex-col gap-2.5 mt-2 border-t border-border pt-4">
              <Link
                href="/preview"
                prefetch={false}
                onClick={() => setMobileOpen(false)}
                className="btn-ghost font-mono text-xs px-4 py-3 tracking-[0.02em] inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                DEMO <ArrowRight size={13} strokeWidth={2.5} />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  const form = document.getElementById("waitlist");
                  if (!form) return;
                  form.scrollIntoView({ behavior: "smooth", block: "center" });
                  const input = form.querySelector<HTMLInputElement>("input[type='email']");
                  if (input) setTimeout(() => input.focus(), 600);
                }}
                className="btn-lime font-mono text-xs px-4 py-3 tracking-[0.02em] inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                EARLY ACCESS <ArrowRight size={13} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
