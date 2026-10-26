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

