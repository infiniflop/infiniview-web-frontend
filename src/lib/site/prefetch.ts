"use client";

import { usePathname } from "next/navigation";

/**
 * Whether links in the shared header and footer should prefetch their targets.
 *
 * On the marketing routes they should (it makes Home <-> Pricing instant). On the 404 document, which
 * navigates with full page loads (see hard-nav.tsx), a prefetch only downloads stylesheets and fonts
 * that the 404 itself never uses, and the browser reports them as preloaded but unused.
 */
export function useSitePrefetch(): false | undefined {
  const pathname = usePathname();
  return pathname === "/" || pathname === "/pricing" ? undefined : false;
}
