"use client";

// Single place where GSAP and its plugins are registered for the site.

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, ScrambleTextPlugin, CustomEase);

// The house curve: fast departure, long precise settle.
CustomEase.create("iv", "M0,0 C0.16,0.84 0.24,1 1,1");
// For things that cross the screen (shutters, wipes).
CustomEase.create("iv-in-out", "M0,0 C0.72,0 0.2,1 1,1");

gsap.defaults({ ease: "iv", duration: 0.9 });

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger, SplitText, useGSAP };
