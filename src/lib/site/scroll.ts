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

// the smooth jump currently running, so it can be finished at once if reduced motion is switched on
let inflight: {
  target: string | HTMLElement | number;
  offset: number;
  onComplete?: () => void;
} | null = null;

/** The visitor took over (wheel, touch): the jump is theirs no more, so do not finish it for them. */
export function dropInflight() {
  inflight = null;
}

/**
 * Reduced motion was switched on in the middle of a smooth jump: stop the animation where it is, then
 * finish the jump instantly. The motion contexts are rebuilt for the new preference (pinned sections
 * are unpinned, so the page gets shorter), which moves the target: it is resolved again once that has
 * settled, and the original focus handoff still runs.
 */
export function settleScroll() {
  const j = inflight;
  inflight = null;
  if (!instance || !j || !instance.isScrolling) return;
  instance.scrollTo(window.scrollY, { immediate: true, force: true });
  window.setTimeout(() => scrollToTarget(j.target, { offset: j.offset, immediate: true, onComplete: j.onComplete }), 350);
}

/**
 * Where an element sits in the document, from layout alone. getBoundingClientRect includes any
 * transform in flight (the hero intro translates its blocks by 34px for a second), which would
 * aim a scroll jump at a position the element no longer occupies once the animation ends.
 */
export function documentTop(el: HTMLElement): number {
  let y = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
  return y;
}

/**
 * How an in-page jump to `el` should land. Sections have generous top padding, so their top edge
 * goes just under the fixed nav; a form (the waitlist) is centred in the viewport and the jump
 * focuses its email field, so it is never left hidden behind the nav bar.
 */
export function anchorPlan(el: HTMLElement): { offset: number; focusEl: HTMLElement } {
  if (el instanceof HTMLFormElement) {
    const input = el.querySelector<HTMLElement>("input:not([type=hidden]), textarea, select, button");
    return { offset: -(window.innerHeight / 2 - el.offsetHeight / 2), focusEl: input ?? el };
  }
  return { offset: -20, focusEl: el };
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
      absolute = el ? documentTop(el) : null;
    }
    if (absolute === null) return;
    inflight = immediate ? null : { target, offset, onComplete };
    instance.scrollTo(absolute, {
      offset,
      duration,
      immediate,
      // a jump the user asked for works even if Lenis is stopped at that instant (the mobile menu
      // stops it while open and starts it again as it closes)
      force: true,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      onComplete: () => {
        inflight = null;
        onComplete?.();
      },
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
        ? documentTop(el) + offset
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
