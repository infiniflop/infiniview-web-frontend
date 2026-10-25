"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Wordmark } from "./mark";
import { DOCS_URL, NAV_LINKS } from "./content";
import { gsap, useGSAP, prefersReducedMotion } from "./motion/gsap";
import { useLenis, scrollToTarget } from "./motion/smooth-scroll";

/** Bring the nearest waitlist form into view and focus it. */
export function focusWaitlist(lenis: ReturnType<typeof useLenis>, go: (href: string) => void) {
  const forms = ["waitlist", "waitlist-final"]
    .map((id) => document.getElementById(id))
    .filter((f): f is HTMLElement => !!f);
  if (!forms.length) {
    go("/#waitlist");
    return;
  }
  const mid = window.innerHeight / 2;
  const dist = (el: HTMLElement) => Math.abs(el.getBoundingClientRect().top - mid);
  const form = forms.sort((a, b) => dist(a) - dist(b))[0];
  scrollToTarget(lenis, form, -Math.round(window.innerHeight * 0.3));
  const input = form.querySelector<HTMLInputElement>("input[type='email']");
  window.setTimeout(() => input?.focus({ preventScroll: true }), 900);
}

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  // Glass appears once the page moves; the bar steps aside while reading
  // down and returns the moment you scroll up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 320);
        last = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useGSAP(
    () => {
      const el = menuRef.current;
      if (!el) return;
      const reduced = prefersReducedMotion();
      tl.current = gsap
        .timeline({ paused: true, defaults: { ease: "iv" } })
        .set(el, { display: "flex" })
        .fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: reduced ? 0 : 0.6, ease: "iv-in-out" })
        .from(el.querySelectorAll("[data-menu-item]"), { yPercent: 110, opacity: 0, duration: reduced ? 0 : 0.7, stagger: 0.05 }, reduced ? 0 : 0.18);
    },
    { scope: menuRef },
  );

  useEffect(() => {
    if (open) {
      tl.current?.timeScale(1).play();
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      tl.current?.timeScale(1.6).reverse();
      lenis?.start();
      document.body.style.overflow = "";
    }
  }, [open, lenis]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => (href === "/pricing" ? pathname === "/pricing" : false);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          hidden && !open && "-translate-y-full",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            scrolled || open ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="glass-strong absolute inset-0 !shadow-none" />
        </div>
        <nav className="frame relative flex h-[68px] items-center gap-6" aria-label="Main">
          <Link href="/" className="relative z-10 -m-2 p-2" aria-label="Infiniview home" onClick={() => setOpen(false)}>
            <Wordmark />
          </Link>

          <ul className="ml-auto hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    "rounded-[2px] px-3.5 py-2 text-[1.0625rem] text-ink-2 transition-colors hover:bg-ink/[0.06] hover:text-ink",
                    isActive(l.href) && "text-ink",
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={DOCS_URL}
                className="inline-flex items-center gap-1 rounded-[2px] px-3.5 py-2 text-[1.0625rem] text-ink-2 transition-colors hover:bg-ink/[0.06] hover:text-ink"
              >
                Docs <ArrowUpRight size={14} strokeWidth={2} aria-hidden />
              </a>
            </li>
          </ul>

          <div className="ml-auto flex items-center gap-2 lg:ml-4">
            <Link href="/preview" prefetch={false} className="btn btn-glass hidden !h-10 !px-4 !text-[0.875rem] sm:inline-flex">
              Demo
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                focusWaitlist(lenis, router.push);
              }}
              className="btn btn-flare hidden !h-10 !px-4 !text-[0.875rem] sm:inline-flex"
            >
              Get early access
            </button>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="relative z-10 -mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
            >
              <span className="relative block h-3 w-6">
                <span
                  className={cn(
                    "absolute left-0 top-0 h-[2px] w-6 bg-ink transition-transform duration-300",
                    open && "translate-y-[5px] rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-[2px] w-6 bg-ink transition-transform duration-300",
                    open && "-translate-y-[5px] -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <div
        id="site-menu"
        ref={menuRef}
        className="glass-strong fixed inset-0 z-40 hidden flex-col justify-between px-[clamp(20px,3.4vw,52px)] pb-10 pt-28 lg:!hidden"
        aria-hidden={!open}
      >
        <ul className="flex flex-col gap-1">
          {[...NAV_LINKS, { label: "Docs", href: DOCS_URL }, { label: "Demo", href: "/preview" }].map((l) => (
            <li key={l.href} className="overflow-hidden">
              <a
                data-menu-item
                href={l.href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className="t-h2 block py-1.5"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div data-menu-item className="flex flex-col gap-3">
          <button
            type="button"
            tabIndex={open ? 0 : -1}
            onClick={() => {
              setOpen(false);
              window.setTimeout(() => focusWaitlist(lenis, router.push), 350);
            }}
            className="btn btn-flare w-full"
          >
            Get early access
          </button>
        </div>
      </div>
    </>
  );
}
