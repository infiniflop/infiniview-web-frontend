"use client";

// Lenis drives the page scroll and is ticked by GSAP's clock, so the scroll
// position ScrollTrigger reads is always the one that was just painted.
// Skipped entirely for reduced motion and touch-first devices, where native
// scrolling is the better experience.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap";

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

const HEADER_OFFSET = -88;

/** Scroll to an element or hash, through Lenis when it is running. */
export function scrollToTarget(lenis: Lenis | null, target: string | HTMLElement, offset = HEADER_OFFSET) {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.4 });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReducedMotion() || coarse) return;

    const instance = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, smoothWheel: true });
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- publish the instance once it exists
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  // In-page anchors (#id and /#id while on /) go through the same scroller.
  // Capture phase, so this runs before next/link's own click handling.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      let hash = "";
      if (href.startsWith("#")) hash = href;
      else if (href.startsWith("/#") && window.location.pathname === "/") hash = href.slice(1);
      if (!hash || hash === "#") return;
      const el = document.querySelector<HTMLElement>(hash);
      if (!el) return;
      e.preventDefault();
      scrollToTarget(lenis, el);
      history.replaceState(null, "", hash);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [lenis]);

  // Arriving at /#section from another page.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      lenis?.scrollTo(0, { immediate: true });
      return;
    }
    const id = window.setTimeout(() => scrollToTarget(lenis, hash), 120);
    return () => window.clearTimeout(id);
  }, [pathname, lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
