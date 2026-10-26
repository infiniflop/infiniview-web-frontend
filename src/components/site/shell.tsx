"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import {
  gsap,
  ScrollTrigger,
  SplitText,
  useGSAP,
  prefersReducedMotion,
  isCoarsePointer,
} from "@/lib/site/gsap";
import { scene } from "@/lib/site/scene";
import { setLenis, scrollToTarget, settleScroll, dropInflight, focusWhenReady, anchorPlan, documentTop, hasInflight } from "@/lib/site/scroll";
import { Corridor } from "@/components/site/corridor";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// the header's entrance plays once per page load, however many times the shell remounts
let navIntroPlayed = false;

/**
 * SiteShell — the single owner of time on this site.
 *   · Lenis smooth scroll, driven from GSAP's ticker (one clock for everything)
 *   · scroll → corridor depth, pointer → light
 *   · scroll reveals + split-text headings
 */
export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  /* ── Engine: Lenis + damping + pointer. Mounted once. ───────────────── */
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const coarse = isCoarsePointer();
    // The motion layer arrived after the 5s failsafe had already shown everything (a slow connection):
    // hiding that content again to play its entrance would make readable text vanish and reappear.
    const late = document.documentElement.classList.contains("reveal-failsafe");
    let lenis: Lenis | null = null;
    let intro: gsap.core.Tween | null = null;

    if (!reduced) {
      lenis = new Lenis({
        lerp: 0.09,
        wheelMultiplier: 0.95,
        smoothWheel: true,
        anchors: false,
      });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
      lenis.on("scroll", (l: Lenis) => {
        scene.target = (l.scroll / window.innerHeight) * 0.82;
        scene.velocity = clamp(l.velocity / 70, -1, 1);
      });
    }

    const tick = (time: number, deltaMs: number) => {
      lenis?.raf(time * 1000);
      const dt = Math.min(deltaMs, 64) / 1000;
      const k = 1 - Math.exp(-dt * 4.5);
      scene.depth += (scene.target - scene.depth) * k;
      scene.velocity *= Math.exp(-dt * 3.2);
      const kp = 1 - Math.exp(-dt * 5);
      scene.px += (scene.tx - scene.px) * kp;
      scene.py += (scene.ty - scene.py) * kp;
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // The motion preference can change while the page is open: smooth scrolling and the pointer-driven
    // light follow it live (Lenis reads its options on every wheel event).
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let onLayoutMode: () => void = () => {};
    const onMotionPref = () => {
      if (lenis) lenis.options.smoothWheel = !mqReduce.matches;
      const jumping = hasInflight();
      if (mqReduce.matches) {
        scene.tx = 0;
        scene.ty = 0;
        settleScroll(); // a smooth jump already under way is finished at once, focus handoff included
      }
      // the pins come or go with this preference: keep the reader where they were (a jump that was in
      // flight has just been finished at its target, which is exactly where they asked to be)
      if (!jumping) onLayoutMode();
    };
    mqReduce.addEventListener("change", onMotionPref);

    // Layout rebuilds (rotating a tablet, a phone's URL bar changing the height, motion switched on) add
    // or remove the pinned sections, so the page gets thousands of px longer or shorter and the scroll
    // position no longer means what it did. Remember where the reader was in terms of a section (and how
    // far through it), and put them back there once the new layout has settled.
    let anchor: { el: HTMLElement; ratio: number } | null = null;
    // while a rebuild is settling the anchor is frozen: scroll events from the transitional layout
    // (the browser clamping the position as pins come and go) must not overwrite where the reader was
    let frozen: { el: HTMLElement; ratio: number } | null = null;
    let freezeTimer = 0;
    let anchorRaf = 0;
    // where the reader is, kept for this tab so a reload (or Back) can put them there again
    const SCROLL_KEY = "iv:scroll:";
    let saveTimer = 0;
    let disposed = false;
    let stopInputWatch = () => {};
    const saveScroll = () => {
      try {
        sessionStorage.setItem(SCROLL_KEY + window.location.pathname, String(Math.round(window.scrollY)));
      } catch {
        /* storage can be unavailable */
      }
    };
    const queueSave = () => {
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        if (!frozen) saveScroll();
      }, 150);
    };
    const sections = () => document.querySelectorAll<HTMLElement>("main > section[id], footer.foot");
    const trackAnchor = () => {
      cancelAnimationFrame(anchorRaf);
      anchorRaf = requestAnimationFrame(() => {
        if (frozen) return;
        const y = window.scrollY;
        let best: HTMLElement | null = null;
        let bestTop = -Infinity;
        sections().forEach((el) => {
          const t = documentTop(el);
          if (t <= y + 1 && t > bestTop) {
            best = el;
            bestTop = t;
          }
        });
        if (best) anchor = { el: best, ratio: (y - bestTop) / Math.max(1, (best as HTMLElement).offsetHeight) };
      });
    };
    window.addEventListener("scroll", trackAnchor, { passive: true });
    trackAnchor();
    const restoreTimers: number[] = [];
    onLayoutMode = () => {
      const a = frozen ?? anchor; // the position from before the first change of a burst
      if (!a) return;
      frozen = a;
      restoreTimers.splice(0).forEach((t) => window.clearTimeout(t));
      window.clearTimeout(freezeTimer);
      const go = () => {
        ScrollTrigger.refresh(); // the pins and the scroll-spy triggers measure the new layout
        if (!a.el.isConnected) return;
        scrollToTarget(documentTop(a.el) + a.ratio * a.el.offsetHeight, { immediate: true });
      };
      restoreTimers.push(window.setTimeout(go, 60), window.setTimeout(go, 400));
      freezeTimer = window.setTimeout(() => {
        frozen = null;
        trackAnchor();
      }, 800);
    };
    window.addEventListener("scroll", queueSave, { passive: true });
    window.addEventListener("pagehide", saveScroll);
    const navType = (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type;
    if ((navType === "reload" || navType === "back_forward") && !window.location.hash) {
      let saved = 0;
      try {
        saved = Number(sessionStorage.getItem(SCROLL_KEY + window.location.pathname)) || 0;
      } catch {
        /* storage can be unavailable */
      }
      if (saved > 600) {
        // the browser restores the position while the page is still short (the pins are not built yet) and
        // clamps it: once the layout has settled, put the reader back, unless they have already moved
        let moved = false;
        const noteInput = () => {
          moved = true;
        };
        window.addEventListener("wheel", noteInput, { once: true, passive: true });
        window.addEventListener("touchstart", noteInput, { once: true, passive: true });
        window.addEventListener("keydown", noteInput, { once: true });
        stopInputWatch = () => {
          window.removeEventListener("wheel", noteInput);
          window.removeEventListener("touchstart", noteInput);
          window.removeEventListener("keydown", noteInput);
        };
        const settle = () => {
          if (disposed || moved) return;
          ScrollTrigger.refresh();
          if (Math.abs(window.scrollY - saved) > 200) scrollToTarget(saved, { immediate: true });
        };
        const ready = document.fonts?.ready ?? Promise.resolve();
        ready.then(() => {
          if (!disposed) restoreTimers.push(window.setTimeout(settle, 250), window.setTimeout(settle, 900));
        });
      }
    }
    const layoutQueries = [
      "(min-width: 1024px)",
      "(min-height: 560px)",
      "(min-height: 480px)",
      "(orientation: landscape)",
    ].map((q) => window.matchMedia(q));
    const layoutListener = () => onLayoutMode();
    layoutQueries.forEach((mq) => mq.addEventListener("change", layoutListener));

    // An ordinary resize (a browser zoom step, a window drag) crosses none of the breakpoints above, yet the
    // pinned sections are measured in viewport units, so the page gets taller or shorter and the same scroll
    // offset lands in another section. The first resize event freezes where the reader was; once the size has
    // stopped changing they are put back there. On a touch screen a modest height change on its own (the
    // address bar folding away) is not a resize in this sense.
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    let resizeTimer = 0;
    const onResize = () => {
      // a soft keyboard opening for a field is a resize too, and the browser is already scrolling that field into view
      const ae = document.activeElement;
      if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return;
      const moved =
        Math.abs(window.innerWidth - lastW) >= 1 || Math.abs(window.innerHeight - lastH) > (coarse ? 150 : 0);
      if (moved && !frozen && anchor) frozen = anchor;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!frozen) return;
        lastW = window.innerWidth;
        lastH = window.innerHeight;
        onLayoutMode();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    window.addEventListener("wheel", dropInflight, { passive: true });
    window.addEventListener("touchstart", dropInflight, { passive: true });

    // pointer → corridor light
    const onMove = (e: PointerEvent) => {
      if (mqReduce.matches) return;
      scene.tx = (e.clientX / window.innerWidth) * 2 - 1;
      scene.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    if (!coarse) window.addEventListener("pointermove", onMove, { passive: true });

    // the header arrives with the opening shot, once per page load (not on every client-side return)
    let navIntro: gsap.core.Tween | null = null;
    const navEl = document.querySelector(".site-nav");
    if (!reduced && !late && !navIntroPlayed && navEl) {
      navIntroPlayed = true;
      navIntro = gsap.fromTo(
        navEl,
        { opacity: 0, y: -36 },
        { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", delay: 0.45, clearProps: "transform" },
      );
    }

    // intro: fly the camera in from far away (the page's opening shot)
    if (!reduced && !late) {
      intro = gsap.fromTo(
        scene,
        { intro: -6 },
        { intro: 0, duration: 3.4, ease: "expo.out", delay: 0.05 },
      );
    } else {
      scene.intro = 0;
    }

    // in-page anchors share Lenis' feel, and still move keyboard focus like a native jump
    const FOCUSABLE = "a[href],button,input,select,textarea,[tabindex]";
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const raw = a.getAttribute("href")!;
      if (raw.length < 2) return;
      let id: string;
      try {
        id = decodeURIComponent(raw.slice(1));
      } catch {
        return; // malformed escape: let the browser handle it
      }
      const el = document.getElementById(id); // not querySelector: ids like "1-step" are not valid selectors
      if (!el) return;
      e.preventDefault();
      // like a native anchor jump: a new fragment is a history entry (Back returns to where the
      // visitor was), and following the link already in the URL does not add a duplicate one
      if (window.location.hash !== raw) history.pushState(null, "", raw);
      // focus once the travel is done: the target may be hidden until the scroll reveals it, and
      // preventDefault cancelled the native focus move, so Tab would otherwise continue from the link
      const plan = anchorPlan(el);
      if (!plan.focusEl.matches(FOCUSABLE)) plan.focusEl.setAttribute("tabindex", "-1");
      scrollToTarget(el, { offset: plan.offset, onComplete: () => focusWhenReady(plan.focusEl) });
    };
    document.addEventListener("click", onClick);

    // Back/Forward in the middle of a smooth jump: halt Lenis' animation where it is, so it does not
    // drag the page on to the target the visitor just left (the browser restores the saved scroll
    // position right after popstate, and Lenis then follows the native scroll again)
    const onPop = () => lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
    window.addEventListener("popstate", onPop);

    // the motion layer is up: if the 5s failsafe already un-hid the page because hydration was slow,
    // hand control back to the reveal system (the reveal batch handles items already above the fold)
    document.documentElement.dataset.motion = "ready";
    document.documentElement.classList.remove("reveal-failsafe");
    document.documentElement.classList.add("surface-dark"); // also covers client navigation in from /preview

    return () => {
      document.documentElement.classList.remove("surface-dark");
      if (navIntro && navIntro.progress() < 1) navIntroPlayed = false; // an interrupted entrance (StrictMode) plays again
      navIntro?.kill();
      if (navEl?.isConnected) gsap.set(navEl, { clearProps: "opacity,transform" });
      intro?.kill();
      gsap.ticker.lagSmoothing(500, 33); // GSAP's defaults, which this effect overrode
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onMove);
      mqReduce.removeEventListener("change", onMotionPref);
      layoutQueries.forEach((mq) => mq.removeEventListener("change", layoutListener));
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("scroll", trackAnchor);
      window.removeEventListener("pagehide", saveScroll);
      window.removeEventListener("scroll", queueSave);
      disposed = true;
      stopInputWatch();
      window.clearTimeout(saveTimer);
      cancelAnimationFrame(anchorRaf);
      window.clearTimeout(freezeTimer);
      restoreTimers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("wheel", dropInflight);
      window.removeEventListener("touchstart", dropInflight);
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPop);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  /* ── After a client-side route change, focus belongs to the new page. Without this it stays on the
     link that was activated (often the footer), and the next Tab jumps back down the old page. ── */
  // compared against the previous path, not a "first run" flag: StrictMode runs effects twice on load
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    const main = document.getElementById("main");
    if (!main) return;
    if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
    main.focus({ preventScroll: true });
  }, [pathname]);

  /* ── Deep links: `/#faq` (direct load or arriving from /pricing) ────────
     The browser/Next jump happens before fonts load and before the pinned
     sections add their spacers, so it lands in the wrong place. Once layout has
     settled, go to the right one. The hash is read when the jump runs, not when
     this effect runs: on a client-side navigation Next updates the URL *after*
     layout effects. */
  useEffect(() => {
    let cancelled = false;
    const go = () => {
      if (cancelled) return;
      let id = "";
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      ScrollTrigger.refresh();
      const plan = anchorPlan(el);
      scrollToTarget(el, { offset: plan.offset, immediate: true });
      // "Early access" pressed on a page without a form (the 404) sent the visitor here: finish the job
      try {
        if (sessionStorage.getItem("iv:focus-waitlist")) {
          sessionStorage.removeItem("iv:focus-waitlist");
          el.querySelector<HTMLInputElement>("input[type='email']")?.focus({ preventScroll: true });
        }
      } catch {
        /* storage can be unavailable */
      }
    };
    const ready = document.fonts?.ready ?? Promise.resolve();
    ready.then(() => requestAnimationFrame(() => requestAnimationFrame(() => window.setTimeout(go, 60))));
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  /* ── Reveals + split headings. Re-run per route. ────────────────────── */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (document.documentElement.classList.contains("reveal-failsafe")) {
          // late boot (see the engine): what the failsafe showed stays shown, with no entrance replay
          document.querySelectorAll("[data-reveal],[data-cta]").forEach((el) => el.setAttribute("data-revealed", ""));
          gsap.set("[data-split],[data-intro],[data-hero-title]", { opacity: 1 });
          return;
        }
        // 1. staggered reveals for anything marked data-reveal
        const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
        ScrollTrigger.batch(items, {
          start: "top 90%",
          once: true,
          batchMax: 8,
          interval: 0.08,
          onEnter: (batch) => {
            // opacity (not visibility): unrevealed content stays focusable and in the a11y tree, so
            // keyboard and screen-reader users are never locked out of what has not scrolled in yet
            const els = (batch as HTMLElement[]).filter((el) => !el.hasAttribute("data-revealed"));
            if (!els.length) return; // all already shown (by focus, or before a context rebuild)
            els.forEach((el) => el.setAttribute("data-revealed", ""));
            gsap.fromTo(
              els,
              {
                opacity: 0,
                y: (_i, el: HTMLElement) => (el.dataset.reveal === "fade" ? 0 : 40),
                scale: (_i, el: HTMLElement) => (el.dataset.reveal === "scale" ? 0.94 : 1),
              },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.1,
                ease: "expo.out",
                stagger: 0.09,
                overwrite: true,
                clearProps: "transform",
              },
            );
          },
        });

        // Keyboard focus lands inside something that has not scrolled in yet (Tab, skip links, find in
        // page): show it at once, and keep the scroll-reveal from replaying over it.
        const onFocusIn = (e: FocusEvent) => {
          const el = (e.target as Element | null)?.closest<HTMLElement>("[data-reveal],[data-cta]");
          if (!el || el.hasAttribute("data-revealed")) return;
          el.setAttribute("data-revealed", "");
          gsap.killTweensOf(el);
          gsap.set(el, { opacity: 1, y: 0, scale: 1, clearProps: "transform" });
        };
        document.addEventListener("focusin", onFocusIn);

        // 2. split headings: lines rise out of masks. autoSplit re-splits once the web font arrives,
        // so line breaks are never frozen at fallback-font metrics; every split is reverted with the
        // route (this callback's cleanup), so nothing outlives the page that created it.
        const splits: SplitText[] = [];
        let cancelled = false;
        gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
          if (cancelled) return;
          splits.push(
            SplitText.create(el, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              linesClass: "split-line",
              aria: "auto",
              onSplit(self) {
                if (cancelled) return;
                gsap.set(el, { visibility: "visible", opacity: 1 });
                return gsap.from(self.lines, {
                  yPercent: 135,
                  rotate: 2.5,
                  transformOrigin: "0% 100%",
                  duration: 1.25,
                  ease: "expo.out",
                  stagger: 0.1,
                  scrollTrigger: { trigger: el, start: "top 88%", once: true },
                });
              },
            }),
          );
        });
        ScrollTrigger.refresh();

        return () => {
          cancelled = true;
          document.removeEventListener("focusin", onFocusIn);
          splits.forEach((sp) => sp.revert());
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-reveal], [data-split], [data-intro], [data-cta]", { opacity: 1, clearProps: "transform" });
      });

      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener("load", onLoad);
      return () => {
        window.removeEventListener("load", onLoad);
        mm.revert();
      };
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <div className="site-root">
      <Corridor />
      <div className="site-content">{children}</div>
    </div>
  );
}
