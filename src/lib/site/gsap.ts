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
 * A damped spring as a GSAP ease: arrives fast, overshoots by under a tenth, settles. For controls
 * and indicators that should feel placed by a hand (the nav pill, toggles). Arrivals of content use
 * expo/power out, departures use power in; this is the third kind, for the interface itself.
 * The CSS twin is `--spring` in site.css (same damping ratio and frequency).
 */
export const spring = (p: number) => {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  const z = 0.6;
  const w = 2 * Math.PI * 1.5;
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * p) * (Math.cos(wd * p) + ((z * w) / wd) * Math.sin(wd * p));
};
