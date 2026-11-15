"use client";

import { gsap } from "@/lib/site/gsap";

/**
 * Shared, mutable scene state. The wall shader reads this every frame; chapters aim the light behind
 * the glass as they come into view, so the world changes with the story (alert = attackers, proof =
 * verified) without any section owning the canvas.
 *
 * The light is a backlight. A chapter anchors it to its own product surface (the stage, the chamber,
 * the console), and it then travels with that surface as the page scrolls: its core is always behind
 * something opaque and only its halo shows around the edges. Copy never sits on the light, which is
 * what keeps text over the wall at AA (measured from pixels; see docs/redesign/README.md). A chapter
 * with no surface to stand behind gets a dim light at the edge of the screen.
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
  /** the element the light stands behind, and where within it (0..1 across, 0..1 down) */
  anchor: null as HTMLElement | null,
  ax: 0.5,
  ay: 0.5,
  /** where the light is on screen right now (0..1 across, 0..1 up): damped toward the anchor or the mood */
  lx: 0.86,
  ly: 0.62,
  mood: {
    /** 0 cool light, 1 vermilion: an attack is under way */
    alert: 0,
    /** 0 cool light, 1 lime: verified proof */
    proof: 0,
    /** brightness of the light behind the wall */
    energy: 0.5,
    /** where the light sits when it has no anchor: 0..1 across, 0..1 up */
    x: 0.86,
    y: 0.62,
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

/** Stand the light behind an element (or release it with null, back to the mood's own x and y). */
export function aimLight(el: HTMLElement | null, ax = 0.5, ay = 0.5) {
  scene.anchor = el;
  scene.ax = ax;
  scene.ay = ay;
}

/** A dim light at the foot of the screen: for chapters that are type alone. */
export const QUIET: Partial<Mood> = { x: 0.5, y: -0.1, spread: 0.3, energy: 0.24, alert: 0, proof: 0 };
