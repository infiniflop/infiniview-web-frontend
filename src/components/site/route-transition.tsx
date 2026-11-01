import { ViewTransition, type ReactNode } from "react";

/**
 * Moving between Home and Pricing is a move along the corridor, not a swap.
 *
 * Wrapped around each page's <main> (a layout persists across navigations, so enter and exit would
 * never fire there). Links say which way they go (`transitionTypes`): forward leaves toward the
 * camera and arrives from depth, back is the reverse. Any other navigation (browser back, a
 * hash link) gets a plain fade. The corridor and the nav sit outside, so they never leave the screen.
 * The motion itself is in site.css (`::view-transition-*(.route-*)`): leaving eases in, arriving eases out.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={{ "route-forward": "route-in-forward", "route-back": "route-in-back", default: "route-fade-in" }}
      exit={{ "route-forward": "route-out-forward", "route-back": "route-out-back", default: "route-fade-out" }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
