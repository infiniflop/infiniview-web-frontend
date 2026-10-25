"use client";

// Single registration point for GSAP and its plugins. Import `gsap` from
// here in client components so plugins are registered exactly once.
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin);

gsap.defaults({ ease: "power3.out", duration: 0.8 });

export { gsap, useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin };

export const REDUCE = "(prefers-reduced-motion: reduce)";
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
