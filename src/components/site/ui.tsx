"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import { gsap, isCoarsePointer, prefersReducedMotion } from "@/lib/site/gsap";

/**
 * The Infiniview mark: a frame inside a frame inside a frame. On hover the
 * frames pulse inward, the way the corridor recedes.
 */
export function Mark({ size = 26, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      className={`mark ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
    >
      <rect className="mark-f1" x="2" y="2" width="28" height="28" rx="9" stroke="currentColor" strokeWidth="2.2" />
      <rect className="mark-f2" x="8.5" y="8.5" width="15" height="15" rx="4.5" stroke="currentColor" strokeWidth="2.2" opacity="0.8" />
      <rect className="mark-f3" x="13" y="13" width="6" height="6" rx="1.8" fill="currentColor" />
    </svg>
  );
}

/**
 * Magnetic: the child leans toward the pointer inside a padded field and
 * springs back on leave. Fine pointers only, off under reduced motion.
 */
export function Magnetic({
  children,
  strength = 0.28,
  className = "",
  style,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || isCoarsePointer() || prefersReducedMotion()) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.55, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.55, ease: "power3.out" });
    const pad = 36;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const inside =
        e.clientX > r.left - pad && e.clientX < r.right + pad &&
        e.clientY > r.top - pad && e.clientY < r.bottom + pad;
      if (inside) {
        xTo((e.clientX - cx) * strength);
        yTo((e.clientY - cy) * strength);
      } else {
        xTo(0);
        yTo(0);
      }
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [strength]);

  return (
    <span ref={ref} className={`inline-flex ${className}`} style={style}>
      {children}
    </span>
  );
}
