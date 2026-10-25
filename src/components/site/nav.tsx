"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { Mark } from "@/components/site/mark";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Proof", href: "/#proof" },
  { label: "Agents", href: "/#agents" },
  { label: "Pricing", href: "/pricing" },
];

export function Nav({ docsUrl }: { docsUrl: string }) {
  const [floating, setFloating] = useState(false);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  const lastY = useRef(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setFloating(y > 24);
      // Hide on fast downward scroll, show on any upward scroll.
      const dy = y - lastY.current;
      if (y > 400 && dy > 6) setHidden(true);
      else if (dy < -2 || y < 400) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
    };
  }, [open, lenis]);

  const goToWaitlist = () => {
    setOpen(false);
    const form = document.getElementById("waitlist");
    if (!form) return;
    if (lenis) lenis.scrollTo(form, { offset: -160 });
    else form.scrollIntoView({ behavior: "smooth", block: "center" });
    const input = form.querySelector<HTMLInputElement>("input[type='email']");
    if (input) setTimeout(() => input.focus({ preventScroll: true }), 700);
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-transform duration-500",
          hidden && !open ? "-translate-y-full" : "translate-y-0",
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
      >
        <div
          className={cn(
            "transition-[background-color,box-shadow,backdrop-filter] duration-500",
            floating || open ? "glass" : "bg-transparent",
          )}
        >
          <nav className="frame flex h-[var(--nav-h)] items-center gap-6">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5 text-ink" aria-label="Infiniview home">
              <Mark size={26} />
              <span className="wordmark text-[19px]">Infiniview</span>
            </Link>

            <div className="flex-1" />

            <ul className="hidden items-center gap-7 lg:flex">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-ink text-[15px]">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={docsUrl} className="link-ink text-[15px]">
                  Docs
                </a>
              </li>
            </ul>

            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/preview" prefetch={false} className="btn btn-quiet btn-sm">
                Demo
              </Link>
              <button type="button" onClick={goToWaitlist} className="btn btn-ink btn-sm" data-magnetic>
                Get early access
              </button>
            </div>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="relative flex h-11 w-11 items-center justify-center text-ink lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <span
                className={cn(
                  "absolute h-[2px] w-6 bg-current transition-transform duration-300",
                  open ? "rotate-45" : "-translate-y-[4px]",
                )}
              />
              <span
                className={cn(
                  "absolute h-[2px] w-6 bg-current transition-transform duration-300",
                  open ? "-rotate-45" : "translate-y-[4px]",
                )}
              />
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-ground transition-opacity duration-400 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
      >
        <div className="frame flex h-full flex-col pt-[calc(var(--nav-h)+24px)] pb-10">
          <ul className="flex flex-col">
            {LINKS.map((l, i) => (
              <li
                key={l.href}
                className="transition-[opacity,transform] duration-500"
                style={{
                  transitionDelay: open ? `${80 + i * 50}ms` : "0ms",
                  opacity: open ? 1 : 0,
                  transform: open ? "none" : "translateY(12px)",
                  transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-4 text-[clamp(2rem,9vw,3rem)] font-medium leading-none tracking-[-0.03em] text-ink"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li
              className="transition-[opacity,transform] duration-500"
              style={{
                transitionDelay: open ? "300ms" : "0ms",
                opacity: open ? 1 : 0,
                transform: open ? "none" : "translateY(12px)",
              }}
            >
              <a
                href={docsUrl}
                onClick={() => setOpen(false)}
                className="block py-4 text-[clamp(2rem,9vw,3rem)] font-medium leading-none tracking-[-0.03em] text-ink"
              >
                Docs
              </a>
            </li>
          </ul>
          <div className="mt-auto flex flex-col gap-2">
            <button type="button" onClick={goToWaitlist} className="btn btn-ink w-full">
              Get early access
            </button>
            <Link href="/preview" prefetch={false} className="btn btn-quiet w-full">
              Open the demo
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
