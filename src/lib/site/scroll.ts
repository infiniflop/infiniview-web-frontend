"use client";

import type Lenis from "lenis";

// The shell owns the Lenis instance; everything else scrolls through here so
// nav links, CTAs and anchors all share the same feel (and degrade to native
// smooth scrolling when Lenis is off, e.g. reduced motion).
let instance: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  instance = l;
}
export function getLenis() {
  return instance;
}

export function scrollToTarget(
  target: string | HTMLElement | number,
  opts: { offset?: number; duration?: number; immediate?: boolean } = {},
) {
  const { offset = 0, duration = 1.5, immediate = false } = opts;
  if (instance) {
    instance.scrollTo(target, {
      offset,
      duration,
      immediate,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    });
    return;
  }
  const el =
    typeof target === "string"
      ? document.querySelector<HTMLElement>(target)
      : typeof target === "number"
        ? null
        : target;
  if (typeof target === "number") {
    window.scrollTo({ top: target + offset, behavior: immediate ? "auto" : "smooth" });
  } else if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
  }
}
