// The Infiniview mark: a box inside a box, the sandbox. Same geometry as the
// product's mark, drawn in the site's palette with the inner box lit.

import { cn } from "@/lib/utils";

export function Mark({ className, size = 22 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <rect x="1.5" y="1.5" width="29" height="29" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x="10" y="10" width="12" height="12" fill="var(--color-flare)" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Mark />
      <span className="text-[1.08rem] font-[680] tracking-[-0.02em] [font-variation-settings:'wdth'_118]">
        Infiniview
      </span>
    </span>
  );
}
