"use client";

import { gsap } from "@/lib/site/gsap";

/**
 * Shared, mutable scene state. The corridor shader reads this every frame;
 * sections nudge `mood` as they enter so the world around the glass changes
 * with the story (alert = attackers red, portal = light at the end).
 */
export const scene = {
  /** camera travel, in frame spacings (scroll-driven, damped) */
  depth: 0,
  target: 0,
  /** fly-in offset on first load, animated to 0 */
  intro: -5,
  /** normalised scroll velocity, damped (-1..1) */
  velocity: 0,
  /** pointer in -1..1 (raw + damped) */
  tx: 0,
  ty: 0,
  px: 0,
  py: 0,
  mood: {
    /** 0 lime/white light → 1 attack red */
    alert: 0,
    /** overall brightness of rings and probes */
    energy: 1,
    /** light at the vanishing point */
    portal: 0.55,
    /** corridor width multiplier */
    width: 1,
  },
};

export type Mood = typeof scene.mood;

export function setMood(to: Partial<Mood>, duration = 1.4) {
  gsap.to(scene.mood, {
    ...to,
    duration,
    ease: "power2.inOut",
    overwrite: "auto",
  });
}
