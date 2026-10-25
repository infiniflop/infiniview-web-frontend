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
import { setLenis, scrollToTarget, focusWhenReady } from "@/lib/site/scroll";
import { Corridor } from "@/components/site/corridor";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * SiteShell — the single owner of time on this site.
 *   · Lenis smooth scroll, driven from GSAP's ticker (one clock for everything)
 *   · scroll → corridor depth, pointer → light
 *   · pointer-lit glass (rim + sheen follow the cursor)
 *   · scroll reveals + split-text headings
 */
export function SiteShell({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  /* ── Engine: Lenis + damping + pointer. Mounted once. ───────────────── */
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const coarse = isCoarsePointer();
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

    // pointer → corridor light
    const onMove = (e: PointerEvent) => {
      scene.tx = (e.clientX / window.innerWidth) * 2 - 1;
      scene.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    if (!coarse && !reduced) window.addEventListener("pointermove", onMove, { passive: true });

    // intro: fly the camera in from far away (the page's opening shot)
    if (!reduced) {
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
      history.replaceState(null, "", raw);
      // focus once the travel is done: the target may be hidden until the scroll reveals it, and
      // preventDefault cancelled the native focus move, so Tab would otherwise continue from the link
      if (!el.matches(FOCUSABLE)) el.setAttribute("tabindex", "-1");
      scrollToTarget(el, { offset: -20, onComplete: () => focusWhenReady(el) });
    };
    document.addEventListener("click", onClick);

    // the motion layer is up: if the 5s failsafe already un-hid the page because hydration was slow,
    // hand control back to the reveal system (the reveal batch handles items already above the fold)
    document.documentElement.dataset.motion = "ready";
    document.documentElement.classList.remove("reveal-failsafe");

    return () => {
      intro?.kill();
      gsap.ticker.lagSmoothing(500, 33); // GSAP's defaults, which this effect overrode
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("click", onClick);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

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
      scrollToTarget(el, { offset: -20, immediate: true });
    };
    const ready = document.fonts?.ready ?? Promise.resolve();
    ready.then(() => requestAnimationFrame(() => requestAnimationFrame(() => window.setTimeout(go, 60))));
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  /* ── Pointer-lit glass ──────────────────────────────────────────────── */
  useEffect(() => {
    if (isCoarsePointer() || prefersReducedMotion()) return;
    const visible = new Set<HTMLElement>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          const el = en.target as HTMLElement;
          if (en.isIntersecting) visible.add(el);
          else visible.delete(el);
        }
      },
      { rootMargin: "120px" },
    );
    const watch = () => {
      document
        .querySelectorAll<HTMLElement>(".site-root .glass")
        .forEach((el) => io.observe(el));
    };
    watch();
    const rescan = window.setTimeout(watch, 900);

    let px = -9999;
    let py = -9999;
    let queued = false;
    const paint = () => {
      queued = false;
      // read every rect first, then write: interleaving reads and writes forces a synchronous
      // layout per element on every pointer/scroll frame
      const els = [...visible];
      const rects = els.map((el) => el.getBoundingClientRect());
      els.forEach((el, i) => {
        const r = rects[i];
        const near =
          px > r.left - 140 && px < r.right + 140 && py > r.top - 140 && py < r.bottom + 140;
        const was = el.dataset.lit === "1";
        if (!near) {
          if (was) {
            el.style.setProperty("--lit", "0");
            el.dataset.lit = "0";
          }
          return;
        }
        if (!was) {
          el.style.setProperty("--lit", "1");
          el.dataset.lit = "1";
        }
        el.style.setProperty("--mx", `${px - r.left}px`);
        el.style.setProperty("--my", `${py - r.top}px`);
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const deg = (Math.atan2(py - cy, px - cx) * 180) / Math.PI + 90;
        el.style.setProperty("--rim-a", `${deg - 40}deg`);
      });
    };
    const queue = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(paint);
      }
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      queue();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", queue, { passive: true });
    return () => {
      window.clearTimeout(rescan);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", queue);
    };
  }, [pathname]);

  /* ── Reveals + split headings. Re-run per route. ────────────────────── */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
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
              maskClass: "split-mask",
              aria: "auto",
              onSplit(self) {
                if (cancelled) return;
                gsap.set(el, { visibility: "visible", opacity: 1 });
                return gsap.from(self.lines, {
                  yPercent: 112,
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
    <div ref={rootRef} className="site-root">
      <Corridor />
      <div className="site-content">{children}</div>
    </div>
  );
}
