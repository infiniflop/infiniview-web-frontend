"use client";

import { useEffect } from "react";

/**
 * The 404 is a document of its own (Next's global-not-found), outside the router's route tree: a
 * client-side navigation from it changes the URL and the title and then renders nothing, leaving the
 * visitor on the 404. Every same-origin link on that page is therefore a plain page load.
 */
export function HardNav() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      e.preventDefault();
      e.stopImmediatePropagation(); // before the router's own handler sees it
      window.location.assign(url.href);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
