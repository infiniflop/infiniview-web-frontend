"use client";

// Headings whose lines rise out of a mask as they enter the viewport.
// SplitText re-splits on resize and font load (autoSplit), and the
// animation is rebuilt inside onSplit so it always matches the lines.

import { useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "./gsap";

type Props = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  id?: string;
  /** Start immediately instead of on scroll (first screen). */
  immediate?: boolean;
  delay?: number;
};

export function SplitHeading({ as: Tag = "h2", className, children, id, immediate, delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        el.classList.remove("split-pending");
        return;
      }
      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit(self) {
          el.classList.remove("split-pending");
          return gsap.from(self.lines, {
            yPercent: 115,
            rotate: 2.5,
            transformOrigin: "0% 100%",
            duration: 1.25,
            stagger: 0.09,
            delay,
            ease: "iv",
            scrollTrigger: immediate ? undefined : { trigger: el, start: "top 86%", once: true },
          });
        },
      });
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={cn("split-pending", className)}>
      {children}
    </Tag>
  );
}
