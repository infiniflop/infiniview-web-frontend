"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/site/gsap";

/** Counts up once when it enters. Tabular figures so the width never jitters. */
export function Counter({
  value,
  suffix = "",
  duration = 1.8,
  className = "",
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || value === 0) {
      el.textContent = `${value}${suffix}`;
      return;
    }
    const o = { v: 0 };
    el.textContent = `0${suffix}`;
    ScrollTrigger.create({
      trigger: el,
      start: "top 92%",
      once: true,
      onEnter: () =>
        gsap.to(o, {
          v: value,
          duration,
          ease: "power3.out",
          onUpdate: () => {
            el.textContent = `${Math.round(o.v)}${suffix}`;
          },
        }),
    });
  }, [value, suffix, duration]);

  return (
    <span ref={ref} className={className} aria-label={`${value}${suffix}`}>
      {value}
      {suffix}
    </span>
  );
}
