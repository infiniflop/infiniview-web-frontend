"use client";

// One controller for every [data-reveal] element on the page: elements rise
// and fade in, staggered within each batch, once, as they enter. Order of
// appearance follows the DOM, so a section's heading, text and picture
// arrive in that order.

import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "./gsap";

export function Reveals() {
  const pathname = usePathname();

  useGSAP(
    () => {
      const els = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (prefersReducedMotion()) {
        gsap.set(els, { opacity: 1, y: 0, clearProps: "transform" });
        return;
      }
      ScrollTrigger.batch(els, {
        start: "top 88%",
        once: true,
        batchMax: 6,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 1.05,
            stagger: 0.075,
            ease: "iv",
            overwrite: true,
            clearProps: "transform",
          }),
      });
      // Anything already above the fold on load.
      ScrollTrigger.refresh();
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
