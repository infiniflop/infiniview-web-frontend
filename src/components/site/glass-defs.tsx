"use client";

import { useEffect } from "react";
import { applyGlassMap, buildGlassMap, supportsBackdropUrl } from "@/lib/site/glass";

/** Red, green and blue are displaced separately and added back together: the rim's colour fringe. */
function Dispersion() {
  return (
    <>
      <feDisplacementMap in="src" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" result="dr" />
      <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
      <feDisplacementMap in="src" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" result="dg" />
      <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
      <feDisplacementMap in="src" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" result="db" />
      <feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
      <feBlend in="r" in2="g" mode="screen" result="rg" />
      <feBlend in="rg" in2="b" mode="screen" result="bent" />
    </>
  );
}

/**
 * The SVG filters behind every piece of glass (lib/site/glass.ts). Each filter is an empty shell in
 * the server's HTML; its displacement map is computed in the browser for the exact size of the glass
 * and written into it. Until then (and whenever a map cannot be built) nothing references the filter,
 * so the glass simply shows what is behind it, unbent.
 *
 *   #glass-lens  the hero lens           (filter on a registered copy: every engine)
 *   #glass-slab  the threat band's slab  (same)
 *   #glass-nav   the nav capsule         (backdrop-filter: Chromium only; others keep blur + rim)
 */
export function GlassDefs() {
  useEffect(() => {
    if (!supportsBackdropUrl()) return;
    // not under reduced transparency or raised contrast: those get a solid bar (site.css)
    if (window.matchMedia("(prefers-reduced-transparency: reduce), (prefers-contrast: more)").matches) return;
    const filter = document.getElementById("glass-nav") as SVGFilterElement | null;
    let bar: HTMLElement | null = null;
    let w = 0;
    let h = 0;
    let timer = 0;
    const build = () => {
      bar = bar?.isConnected ? bar : document.querySelector<HTMLElement>(".nav-bar");
      if (!bar || !filter) return;
      const r = bar.getBoundingClientRect();
      const nw = Math.round(r.width);
      const nh = Math.round(r.height);
      if (!nw || !nh || (nw === w && nh === h)) return;
      w = nw;
      h = nh;
      const map = buildGlassMap({ width: w, height: h, radius: h / 2, bezel: Math.min(22, h * 0.42), depth: 26 }, 16);
      if (applyGlassMap(filter, map, 0.09)) {
        const tokens = new Set((document.documentElement.dataset.glass ?? "").split(" ").filter(Boolean));
        tokens.add("nav");
        document.documentElement.dataset.glass = [...tokens].join(" ");
      }
    };
    build();
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(build, 120);
    });
    const el = document.querySelector<HTMLElement>(".nav-bar");
    if (el) ro.observe(el);
    return () => {
      window.clearTimeout(timer);
      ro.disconnect();
    };
  }, []);

  return (
    <svg className="glass-defs" width="0" height="0" aria-hidden focusable="false">
      <defs>
        {["glass-lens", "glass-slab"].map((id) => (
          <filter key={id} id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB" primitiveUnits="userSpaceOnUse">
            <feImage x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map" />
            <feOffset in="SourceGraphic" dx="0" dy="0" result="src" />
            <Dispersion />
          </filter>
        ))}
        <filter id="glass-nav" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB" primitiveUnits="userSpaceOnUse">
          <feImage x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="src" />
          <Dispersion />
          <feColorMatrix in="bent" type="saturate" values="1.7" />
        </filter>
      </defs>
    </svg>
  );
}
