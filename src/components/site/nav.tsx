"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/site/gsap";
import { Spring, SPRING, onClock } from "@/lib/site/motion";
import { getLenis, scrollToTarget, anchorPlan } from "@/lib/site/scroll";
import { Mark } from "@/components/site/ui";
import { useSitePrefetch } from "@/lib/site/prefetch";
import { DOCS_URL } from "@/lib/site/content";
import { tap } from "@/lib/site/haptics";

const LINKS = [
  { id: "how-it-works", label: "How it works" },
  { id: "findings", label: "Findings" },
  { id: "coverage", label: "Coverage" },
  { id: "faq", label: "FAQ" },
];

export function focusWaitlist() {
  // The page can hold two waitlist forms (the hero's and the finale's). Prefer the one that is
  // already on screen, so the header button never throws a visitor 12,000px back up the page.
  // (after a successful join the form is replaced by its confirmation: that is the thing to bring into view)
  const forms = [...document.querySelectorAll<HTMLElement>("form[id^='waitlist'], .waitlist-done[id^='waitlist']")];
  const visible = forms.find((f) => {
    const r = f.getBoundingClientRect();
    return r.top < window.innerHeight * 0.85 && r.bottom > window.innerHeight * 0.15;
  });
  // none on screen: the nearest one, not always the first (from the FAQ the finale's is a screen away, the hero's is 13,000px)
  const mid = window.innerHeight / 2;
  const nearest = [...forms].sort((a, b) => {
    const da = Math.abs((a.getBoundingClientRect().top + a.getBoundingClientRect().bottom) / 2 - mid);
    const db = Math.abs((b.getBoundingClientRect().top + b.getBoundingClientRect().bottom) / 2 - mid);
    return da - db;
  })[0];
  const form = visible ?? nearest ?? document.getElementById("waitlist");
  if (!form) {
    // no form on this page: go to the page that has one. A full load, not the router: the 404 (a document
    // of its own) cannot navigate client-side, and this is rare enough that it costs nothing elsewhere.
    try {
      sessionStorage.setItem("iv:focus-waitlist", "1"); // the page we land on puts the cursor in the field
    } catch {
      /* storage can be unavailable: the visitor still lands on the form */
    }
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- deliberately a full load (see above)
    window.location.assign("/#waitlist");
    return;
  }
  const input = form.querySelector<HTMLInputElement>("input[type='email']");
  const focusEl = input ?? form; // the confirmation takes focus itself (it has no field)
  if (visible) {
    focusEl.focus({ preventScroll: true });
    return;
  }
  const plan = anchorPlan(form);
  scrollToTarget(form, { offset: plan.offset, duration: 1.6 });
  window.setTimeout(() => focusEl.focus({ preventScroll: true }), 900);
}

/**
 * Same-page section links are plain anchors: next/link would call preventDefault and do its own
 * instant jump, bypassing the shell's smooth, offset-aware scroll (and its focus handoff).
 * Cross-page links (from /pricing) stay next/link so routing is client-side.
 */
function SectionLink({
  isHome,
  href,
  children,
  ...rest
}: { isHome: boolean; href: string } & Omit<React.ComponentProps<"a">, "href">) {
  const prefetch = useSitePrefetch();
  if (isHome) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} prefetch={prefetch} {...rest}>
      {children}
    </Link>
  );
}

export function Nav() {
  const pathname = usePathname();
  const prefetch = useSitePrefetch();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  // The menu stays mounted while it leaves: departures gather speed (ease-in) instead of vanishing.
  // `exiting` is derived while rendering (the value of `open` it last saw), not set from an effect.
  const [seenOpen, setSeenOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  if (seenOpen !== open) {
    setSeenOpen(open);
    setExiting(!open && !prefersReducedMotion());
  }
  const [active, setActive] = useState<string | null>(null);

  const linksRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const activeRef = useRef<string | null>(null);
  // only hand focus back to the burger when the menu was dismissed with the keyboard
  const returnFocus = useRef(false);

  /* ── sliding pill ─────────────────────────────────────────────────────
     A small piece of glass on two springs (its left edge and its width). It keeps its velocity when
     the pointer moves on to another link, and it stretches a little in the direction it is going:
     the left edge and the right edge are not equally stiff, so it reads as liquid, not as a box. */
  const pillState = useRef<{ x: Spring; w: Spring; clock: ReturnType<typeof onClock>; shown: boolean } | null>(null);
  const movePill = useCallback((target: HTMLElement | null, instant = false) => {
    const pill = pillRef.current;
    const wrap = linksRef.current;
    if (!pill || !wrap) return;
    if (!pillState.current) {
      const x = new Spring(0, SPRING.ui);
      const w = new Spring(10, SPRING.ui);
      const clock = onClock((dt) => {
        const a = x.step(dt);
        const b = w.step(dt);
        // (width is layout, but of one absolutely positioned box with no children: a scale would
        // squash the pill's round ends)
        pill.style.transform = `translate3d(${x.value.toFixed(2)}px,0,0)`;
        pill.style.width = `${Math.max(1, w.value).toFixed(2)}px`;
        return a || b;
      });
      pillState.current = { x, w, clock, shown: false };
    }
    const st = pillState.current;
    if (!target) {
      st.shown = false;
      pill.style.opacity = "0";
      return;
    }
    const wr = wrap.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    const left = tr.left - wr.left;
    if (instant || !st.shown || prefersReducedMotion()) {
      st.x.set(left);
      st.w.set(tr.width);
    } else {
      // the leading edge arrives first: going right the width grows ahead of the move, going left it follows
      const right = left > st.x.target;
      st.x.to(left, right ? SPRING.ui : SPRING.follow);
      st.w.to(tr.width, right ? SPRING.follow : SPRING.ui);
    }
    st.shown = true;
    pill.style.opacity = "1";
    st.clock.wake();
  }, []);
  useEffect(() => () => pillState.current?.clock.stop(), []);

  useEffect(() => {
    if (!exiting) return;
    const m = menuRef.current;
    if (!m) return;
    const items = m.querySelectorAll("[data-m]");
    gsap.killTweensOf([m, items]);
    // leaving: everything goes at once, quicker than it came, gathering speed
    gsap.to(items, { y: -16, autoAlpha: 0, duration: 0.2, ease: "power3.in" });
    gsap.to(m, { autoAlpha: 0, duration: 0.24, ease: "power3.in", onComplete: () => setExiting(false) });
    return () => {
      gsap.killTweensOf([m, items]);
    };
  }, [exiting]);

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

  // The links are display:none below 1024px, so a pill measured there is zero-wide. Re-place it
  // whenever the layout changes (rotating a tablet, resizing a window).
  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => restPill(true));
    };
    window.addEventListener("resize", onResize);
    // text metrics can change with no resize (web fonts arriving late, the reader's text size): watch the links
    const ro = new ResizeObserver(onResize);
    linksRef.current?.querySelectorAll("[data-nav]").forEach((el) => ro.observe(el));
    document.fonts?.addEventListener?.("loadingdone", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      document.fonts?.removeEventListener?.("loadingdone", onResize);
    };
  }, [restPill]);

  /* ── scroll-spy (home only) ─────────────────────────────────────────── */
  useGSAP(
    () => {
      if (!isHome) {
        setActive(pathname === "/pricing" ? "pricing" : null);
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
    { dependencies: [isHome, pathname], revertOnUpdate: true },
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
    { dependencies: [pathname], revertOnUpdate: true },
  );

  /* ── mobile menu ────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    const reduced = prefersReducedMotion();
    lenis?.stop();
    document.body.style.overflow = "hidden";
    document.documentElement.dataset.menuOpen = "true";

    // the menu is aria-modal: make everything behind it inert so Tab cannot wander off
    const behind = [
      document.getElementById("main"),
      document.querySelector<HTMLElement>(".foot"),
      document.querySelector<HTMLElement>(".skip-link"),
    ].filter(
      (el): el is HTMLElement => !!el,
    );
    behind.forEach((el) => el.setAttribute("inert", ""));

    const m = menuRef.current;
    const burger = burgerRef.current; // captured: the ref may be cleared by the time cleanup runs
    let focusTimer: number | undefined;
    if (m) {
      const items = m.querySelectorAll("[data-m]");
      if (reduced) {
        gsap.set([m, items], { autoAlpha: 1 });
      } else {
        gsap.fromTo(m, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.28, ease: "power2.out" });
        // links arrive one after another in reading order; the whole sequence stays under half a second
        gsap.fromTo(
          items,
          { y: 24, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6, ease: "expo.out", stagger: 0.045, delay: 0.04 },
        );
      }
      // wait until the first link is actually visible: hidden elements cannot take focus
      focusTimer = window.setTimeout(
        () => m.querySelector<HTMLElement>("[data-m]")?.focus({ preventScroll: true }),
        reduced ? 0 : 260,
      );
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      returnFocus.current = true;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    // aria-modal: Tab must not leave the dialog for the browser's own chrome. The cycle is the close
    // button (the burger sits in the bar, above the overlay) followed by the menu's controls.
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !m || !burger) return;
      const items = [burger, ...m.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
      const first = items[0];
      const last = items[items.length - 1];
      const at = document.activeElement;
      if (e.shiftKey && (at === first || !items.includes(at as HTMLElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (at === last || !items.includes(at as HTMLElement))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onTab);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("keydown", onTab);
      behind.forEach((el) => el.removeAttribute("inert"));
      lenis?.start();
      document.body.style.overflow = "";
      delete document.documentElement.dataset.menuOpen;
      if (returnFocus.current) {
        returnFocus.current = false;
        burger?.focus();
      }
    };
  }, [open]);

  // A menu opened on a phone must not linger (with its trigger hidden) once the bar switches to the full
  // desktop layout. That switch is a container query in em (it follows the text size), so it is read from
  // the burger itself: hidden means the desktop bar is showing.
  useEffect(() => {
    if (!open) return;
    const check = () => {
      if (burgerRef.current && getComputedStyle(burgerRef.current).display === "none") setOpen(false);
    };
    window.addEventListener("resize", check);
    // Back/Forward or a hash change while the menu is open: the page behind it is changing, so close it
    const close = () => setOpen(false);
    window.addEventListener("popstate", close);
    window.addEventListener("hashchange", close);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("popstate", close);
      window.removeEventListener("hashchange", close);
    };
  }, [open]);

  useEffect(() => {
    // close the menu on navigation
    const id = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  const hrefFor = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  // The header CTA stays reachable while the menu is open: close the menu first so the form is not
  // focused behind an overlay, and give scrolling a moment to resume (Lenis is stopped while open).
  const earlyAccess = () => {
    if (open) {
      setOpen(false);
      window.setTimeout(() => focusWaitlist(), 350);
    } else {
      focusWaitlist();
    }
  };

  return (
    <>
      <header className="site-nav">
        <nav aria-label="Primary" className="nav-bar glass">
          <Link
            href="/"
            prefetch={prefetch}
            transitionTypes={["route-back"]}
            aria-label="Infiniview home"
            className="nav-brand"
            {...tap("selection")}
            onClick={(e) => {
              if (open) setOpen(false); // the menu is a modal: it does not stay up while the page moves behind it
              if (isHome) {
                e.preventDefault();
                // closing the menu restarts the smooth scroller, which would cancel a jump begun in the same tick
                if (open) window.setTimeout(() => scrollToTarget(0, { duration: 1.6 }), 350);
                else scrollToTarget(0, { duration: 1.6 });
              }
            }}
          >
            <Mark size={24} className="text-[var(--iv-lime)]" />
            <span className="nav-word">infiniview</span>
          </Link>

          <div
            ref={linksRef}
            className="nav-links"
            onPointerLeave={() => restPill()}
          >
            <span ref={pillRef} className="nav-pill" aria-hidden />
            {LINKS.map((l) => (
              <SectionLink
                key={l.id}
                isHome={isHome}
                href={hrefFor(l.id)}
                data-nav={l.id}
                aria-current={active === l.id ? "location" : undefined}
                className="nav-link"
                {...tap("selection")}
                onPointerEnter={(e) => movePill(e.currentTarget)}
                onFocus={(e) => movePill(e.currentTarget)}
                onBlur={() => restPill()}
              >
                {l.label}
              </SectionLink>
            ))}
            <Link
              href="/pricing"
              prefetch={prefetch}
              transitionTypes={["route-forward"]}
              data-nav="pricing"
              aria-current={pathname === "/pricing" ? "page" : undefined}
              className="nav-link"
              {...tap("selection")}
              onPointerEnter={(e) => movePill(e.currentTarget)}
              onFocus={(e) => movePill(e.currentTarget)}
              onBlur={() => restPill()}
            >
              Pricing
            </Link>
            <a
              href={DOCS_URL}
              className="nav-link"
              {...tap("selection")}
              onPointerEnter={(e) => movePill(e.currentTarget)}
              onFocus={(e) => movePill(e.currentTarget)}
              onBlur={() => restPill()}
            >
              Docs
            </a>
          </div>

          <div className="nav-actions">
            <Link href="/preview" prefetch={false} className="btn btn--glass btn--sm nav-demo" {...tap("selection")}>
              Live demo
            </Link>
            <button type="button" className="btn btn--lime btn--sm" onClick={earlyAccess} {...tap("medium")}>
              Early access
              <ArrowRight className="arrow" size={15} strokeWidth={2.6} />
            </button>
            <button
              ref={burgerRef}
              type="button"
              className="nav-burger"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls={open ? "site-menu" : undefined}
              onClick={() => setOpen((v) => !v)}
              {...tap("light")}
            >
              <i aria-hidden />
              <i aria-hidden />
            </button>
          </div>
        </nav>
      </header>

      {(open || exiting) && (
        <div id="site-menu" ref={menuRef} inert={!open} data-lenis-prevent className="nav-menu" role="dialog" aria-modal="true" aria-label="Menu">
          {/* data-lenis-prevent: Lenis is stopped while the menu is open and would cancel wheel and
              touch gestures, so the menu (which scrolls by itself on short screens) opts out of it */}
          <div className="nav-menu-inner">
            {LINKS.map((l) => (
              <SectionLink
                key={l.id}
                isHome={isHome}
                data-m
                href={hrefFor(l.id)}
                className="nav-menu-link"
                onClick={() => setOpen(false)}
                {...tap("selection")}
              >
                {l.label}
              </SectionLink>
            ))}
            <Link data-m href="/pricing" prefetch={prefetch} transitionTypes={["route-forward"]} className="nav-menu-link" aria-current={pathname === "/pricing" ? "page" : undefined} onClick={() => setOpen(false)} {...tap("selection")}>
              Pricing
            </Link>
            <a data-m href={DOCS_URL} className="nav-menu-link" {...tap("selection")}>
              Docs
            </a>
            <div data-m className="nav-menu-actions">
              <button
                type="button"
                className="btn btn--lime"
                onClick={earlyAccess}
                {...tap("medium")}
              >
                Get early access
                <ArrowRight className="arrow" size={17} strokeWidth={2.6} />
              </button>
              <Link href="/preview" prefetch={false} className="btn btn--glass" onClick={() => setOpen(false)} {...tap("selection")}>
                Open the live demo
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
