"use client";

import type Lenis from "lenis";
import { prefersReducedMotion } from "@/lib/site/gsap";

// The shell owns the Lenis instance; everything else scrolls through here so
// nav links, CTAs and anchors all share the same feel (and degrade to a plain
// jump when Lenis is off, e.g. reduced motion).
let instance: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  instance = l;
}
export function getLenis() {
  return instance;
}

export function scrollToTarget(
  target: string | HTMLElement | number,
  opts: { offset?: number; duration?: number; immediate?: boolean; onComplete?: () => void } = {},
) {
  const { offset = 0, duration = 1.5, onComplete } = opts;
  // travel is motion: under reduced motion every jump is instant
  const immediate = opts.immediate || prefersReducedMotion();

  if (instance) {
    // Lenis resolves an element target as `rect.top + its own internal scroll value`. Programmatic
    // jumps by Next (route changes, hash links) and by ScrollTrigger refreshes move the native scroll
    // without Lenis catching up, which sends element targets to the wrong place. So: resync Lenis to
    // the real position, and hand it an absolute number computed from `window.scrollY`.
    // Its scroll *limit* is also cached (and re-measured on a debounce), so right after a route
    // change it still believes the old, shorter page and clamps the jump: re-measure first.
    instance.resize();
    if (Math.abs(instance.animatedScroll - window.scrollY) > 2) {
      instance.scrollTo(window.scrollY, { immediate: true, force: true });
    }
    let absolute: number | null;
    if (typeof target === "number") absolute = target;
    else {
      const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
      absolute = el ? el.getBoundingClientRect().top + window.scrollY : null;
    }
    if (absolute === null) return;
    instance.scrollTo(absolute, {
      offset,
      duration,
      immediate,
      // a jump the user asked for works even if Lenis is stopped at that instant (the mobile menu
      // stops it while open and starts it again as it closes)
      force: true,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      onComplete: onComplete ? () => onComplete() : undefined,
    });
    return;
  }

  const el =
    typeof target === "string"
      ? document.querySelector<HTMLElement>(target)
      : typeof target === "number"
        ? null
        : target;
  const top =
    typeof target === "number"
      ? target + offset
      : el
        ? el.getBoundingClientRect().top + window.scrollY + offset
        : null;
  if (top === null) return;
  window.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
  if (onComplete) {
    if (immediate) window.setTimeout(onComplete, 0);
    else window.addEventListener("scrollend", () => onComplete(), { once: true });
  }
}

/**
 * Move keyboard focus to an element once it can actually take it. Targets inside
 * a not-yet-revealed section are `visibility:hidden` until the scroll brings them
 * into view, so a single immediate focus() would silently fail.
 */
export function focusWhenReady(el: HTMLElement, tries = 8) {
  const attempt = (n: number) => {
    el.focus({ preventScroll: true });
    if (document.activeElement !== el && n > 0) window.setTimeout(() => attempt(n - 1), 100);
  };
  attempt(tries);
}
