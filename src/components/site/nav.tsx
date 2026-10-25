"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/site/gsap";
import { getLenis, scrollToTarget } from "@/lib/site/scroll";
import { Mark, Magnetic } from "@/components/site/ui";

const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? "https://docs.infiniview.dev";

const LINKS = [
  { id: "how-it-works", label: "How it works" },
  { id: "findings", label: "Findings" },
  { id: "arsenal", label: "Arsenal" },
  { id: "faq", label: "FAQ" },
];

export function focusWaitlist(router?: { push: (href: string) => void }) {
  const form = document.getElementById("waitlist");
  if (!form) {
    router?.push("/#waitlist");
    return;
  }
  scrollToTarget(form, { offset: -(window.innerHeight / 2 - 60), duration: 1.6 });
  const input = form.querySelector<HTMLInputElement>("input[type='email']");
  if (input) window.setTimeout(() => input.focus({ preventScroll: true }), 900);
}

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const linksRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<string | null>(null);

  /* ── sliding pill ───────────────────────────────────────────────────── */
  const movePill = useCallback((target: HTMLElement | null, instant = false) => {
    const pill = pillRef.current;
    const wrap = linksRef.current;
    if (!pill || !wrap) return;
    if (!target) {
      gsap.to(pill, { autoAlpha: 0, duration: 0.25, overwrite: "auto" });
      return;
    }
    const wr = wrap.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    const vars = { x: tr.left - wr.left, width: tr.width, autoAlpha: 1 };
    if (instant) gsap.set(pill, vars);
    else gsap.to(pill, { ...vars, duration: 0.45, ease: "power3.out", overwrite: "auto" });
  }, []);

  const restPill = useCallback(
    (instant = false) => {
      const wrap = linksRef.current;
      const id = activeRef.current;
      const el = id && wrap ? wrap.querySelector<HTMLElement>(`[data-nav="${id}"]`) : null;
      movePill(el, instant);
    },
    [movePill],
  );

  useEffect(() => {
    activeRef.current = active;
    restPill();
  }, [active, restPill]);

  /* ── scroll-spy (home only) ─────────────────────────────────────────── */
  useGSAP(
    () => {
      if (!isHome) {
        setActive(null);
        return;
      }
      const triggers = LINKS.filter(({ id }) => document.getElementById(id)).map(({ id }) =>
        ScrollTrigger.create({
          trigger: `#${id}`,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            if (self.isActive) setActive(id);
            else setActive((cur) => (cur === id ? null : cur));
          },
        }),
      );
      return () => triggers.forEach((t) => t.kill());
    },
    { dependencies: [isHome, pathname] },
  );

  /* ── ink variant while the nav floats over the lime finale ──────────── */
  useGSAP(
    () => {
      const bar = document.querySelector<HTMLElement>(".nav-bar");
      const cta = document.getElementById("challenge");
      if (!bar || !cta) return;
      const st = ScrollTrigger.create({
        trigger: cta,
        start: "top 52px",
        end: "bottom 52px",
        onToggle: (self) => bar.classList.toggle("nav-bar--ink", self.isActive),
      });
      return () => {
        st.kill();
        bar.classList.remove("nav-bar--ink");
      };
    },
    { dependencies: [pathname] },
  );

  /* ── mobile menu ────────────────────────────────────────────────────── */
  useEffect(() => {
    const lenis = getLenis();
    if (open) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
      const m = menuRef.current;
      if (m) {
        gsap.fromTo(m, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power2.out" });
        gsap.fromTo(
          m.querySelectorAll("[data-m]"),
          { y: 44, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out", stagger: 0.07, delay: 0.1 },
        );
      }
      return () => {
        lenis?.start();
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    // close the menu on navigation
    const id = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  const hrefFor = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  return (
    <>
      <header className="site-nav">
        <nav
          aria-label="Primary"
          className="nav-bar glass glass--thin"
          style={{ ["--r" as string]: "999px" }}
        >
          <Link
            href="/"
            aria-label="Infiniview home"
            className="nav-brand"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                scrollToTarget(0, { duration: 1.6 });
              }
            }}
          >
            <Mark size={26} className="text-[var(--iv-lime)]" />
            <span className="nav-word">infiniview</span>
          </Link>

          <div
            ref={linksRef}
            className="nav-links"
            onPointerLeave={() => restPill()}
          >
            <span ref={pillRef} className="nav-pill" aria-hidden />
            {LINKS.map((l) => (
              <Link
                key={l.id}
                href={hrefFor(l.id)}
                data-nav={l.id}
                aria-current={active === l.id ? "location" : undefined}
                className="nav-link"
                onPointerEnter={(e) => movePill(e.currentTarget)}
                onFocus={(e) => movePill(e.currentTarget)}
                onBlur={() => restPill()}
              >
                {l.label}
              </Link>
            ))}
            <a
              href={DOCS_URL}
              className="nav-link"
              onPointerEnter={(e) => movePill(e.currentTarget)}
              onFocus={(e) => movePill(e.currentTarget)}
              onBlur={() => restPill()}
            >
              Docs
            </a>
          </div>

          <div className="nav-actions">
            <Link href="/preview" prefetch={false} className="btn btn--glass btn--sm nav-demo">
              Live demo
            </Link>
            <Magnetic strength={0.22}>
              <button
                type="button"
                className="btn btn--lime btn--sm"
                onClick={() => focusWaitlist(router)}
              >
                Early access
                <ArrowRight className="arrow" size={15} strokeWidth={2.6} />
              </button>
            </Magnetic>
            <button
              type="button"
              className="nav-burger"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div ref={menuRef} className="nav-menu glass glass--deep" style={{ ["--r" as string]: "0px" }} role="dialog" aria-modal="true" aria-label="Menu">
          <div className="nav-menu-inner">
            {LINKS.map((l) => (
              <Link key={l.id} data-m href={hrefFor(l.id)} className="nav-menu-link" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <a data-m href={DOCS_URL} className="nav-menu-link">
              Docs
            </a>
            <div data-m className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                className="btn btn--lime"
                onClick={() => {
                  setOpen(false);
                  window.setTimeout(() => focusWaitlist(router), 350);
                }}
              >
                Get early access
                <ArrowRight className="arrow" size={17} strokeWidth={2.6} />
              </button>
              <Link href="/preview" prefetch={false} className="btn btn--glass" onClick={() => setOpen(false)}>
                Open the live demo
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
