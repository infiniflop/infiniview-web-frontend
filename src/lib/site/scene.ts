"use client";

import { gsap } from "@/lib/site/gsap";

/**
 * Shared, mutable scene state. The wall shader reads this every frame; chapters move the light
 * behind the glass as they come into view, so the world changes with the story (alert = attackers,
 * proof = verified) without any section owning the canvas.
 */
export const scene = {
  /** scroll position in screen heights (damped) */
  depth: 0,
  target: 0,
  /** normalised scroll velocity, damped (-1..1) */
  velocity: 0,
  /** pointer in -1..1 (raw + damped) */
  tx: 0,
  ty: 0,
  px: 0,
  py: 0,
  /** set while something opaque covers the whole viewport (the lime finale): skip drawing */
  occluded: false,
  mood: {
    /** 0 cool light, 1 vermilion: an attack is under way */
    alert: 0,
    /** 0 cool light, 1 lime: verified proof */
    proof: 0,
    /** brightness of the light behind the wall */
    energy: 0.62,
    /** where the light sits: 0..1 across, 0..1 up */
    x: 0.84,
    y: 0.34,
    /** its radius, in screen heights */
    spread: 0.24,
  },
};

export type Mood = typeof scene.mood;

export function setMood(to: Partial<Mood>, duration = 1.6) {
  gsap.to(scene.mood, {
    ...to,
    duration,
    ease: "power2.inOut",
    overwrite: "auto",
  });
}
