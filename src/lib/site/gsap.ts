"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// One registration point so every section shares the same GSAP instance,
// the same ticker and the same defaults. GSAP is free for commercial use
// (Webflow-sponsored "no charge" licence); all plugins ship in the npm package.
let ready = false;
export function registerGsap() {
  if (ready || typeof window === "undefined") return gsap;
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
  ready = true;
  return gsap;
}
registerGsap();

export { gsap, ScrollTrigger, SplitText, useGSAP };

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isCoarsePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: none), (pointer: coarse)").matches;

/**
 * Where to park a split line so none of it shows above the bottom edge of its mask. A percentage of the
 * line is not enough: the mask is taller than the line (room for descenders, see .split-line-mask) and a
 * tight line-height lets the tops of capitals and ascenders hang out above the line box, so a fixed
 * 135% left slivers of those tops showing before the rise began. Measured from the real geometry, in px.
 */
export const parkBelowMask = (_index: number, line: Element) => {
  const mask = line.parentElement;
  if (!mask) return 0;
  const style = getComputedStyle(mask);
  const fontSize = parseFloat(style.fontSize) || 16;
  // the line's top edge down to the mask's bottom edge, plus the most a glyph overhangs the line box
  return mask.clientHeight - (parseFloat(style.paddingTop) || 0) + fontSize * 0.3;
};
