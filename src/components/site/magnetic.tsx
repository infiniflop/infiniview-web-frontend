"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Primary actions lean toward the pointer. Mount once; every element with
 * `data-magnetic` inside `document` takes part. Fine pointers only.
 */
export function Magnetic() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    const cleanups: (() => void)[] = [];
    const bind = (el: HTMLElement) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        xTo(dx * 0.22);
        yTo(dy * 0.28);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      });
    };
    document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach(bind);
    const mo = new MutationObserver((muts) => {
      muts.forEach((m) =>
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.matches("[data-magnetic]")) bind(n);
          n.querySelectorAll<HTMLElement>("[data-magnetic]").forEach(bind);
        }),
      );
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      cleanups.forEach((c) => c());
    };
  }, []);
  return null;
}
