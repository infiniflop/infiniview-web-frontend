import { cn } from "@/lib/utils";

/**
 * The Infiniview mark: a lens. An open ring with the aperture offset toward
 * the light, the same shape the hero's lens draws over the page.
 */
export function Mark({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="14.6" cy="9.4" r="3.4" fill="currentColor" />
    </svg>
  );
}
