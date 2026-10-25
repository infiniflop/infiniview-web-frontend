"use client";

import { useRef, type ReactNode, type ElementType } from "react";
import { gsap, useGSAP, SplitText, MOTION_OK } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Pixels the parts rise from. */
  y?: number;
  /** Seconds between parts. */
  stagger?: number;
  /** ScrollTrigger start. */
  start?: string;
  id?: string;
};

/**
 * Section entrance. Every descendant marked `data-reveal` rises into place,
 * staggered, once, as the section enters. A heading marked
 * `data-reveal="lines"` is split into lines that rise out of a mask instead.
 * Without JS (or with reduced motion) everything is simply visible.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  y = 24,
  stagger = 0.08,
  start = "top 82%",
  id,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const parts = gsap.utils.toArray<HTMLElement>("[data-reveal]", root);
      if (!parts.length) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const splits: SplitText[] = [];
        const plain = parts.filter((p) => p.dataset.reveal !== "lines");
        const lined = parts.filter((p) => p.dataset.reveal === "lines");

        lined.forEach((h) => {
          h.classList.add("is-in");
          const split = SplitText.create(h, {
            type: "lines",
            mask: "lines",
            linesClass: "split-line",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                duration: 1.1,
                ease: "power4.out",
                stagger: 0.09,
                scrollTrigger: { trigger: h, start, once: true },
              }),
          });
          splits.push(split);
        });

        if (plain.length) {
          gsap.set(plain, { y, opacity: 0 });
          gsap.to(plain, {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            stagger,
            clearProps: "transform",
            onStart: () => plain.forEach((p) => p.classList.add("is-in")),
            scrollTrigger: { trigger: root, start, once: true },
          });
        }
        return () => splits.forEach((s) => s.revert());
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        parts.forEach((p) => p.classList.add("is-in"));
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className} id={id}>
      {children}
    </Tag>
  );
}
