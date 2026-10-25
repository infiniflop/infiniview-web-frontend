// Shared, mutable state for the sandbox scene.
//
// GSAP owns every timeline on the page (scroll, the hero's sample run) and
// tweens these plain numbers. The R3F scene only *reads* them inside
// useFrame. One writer, one reader: the two animation systems never fight
// over the same object.

export type SceneState = {
  /** 0 = glass scattered into shards, 1 = sealed block. */
  assemble: number;
  /** 0..1 how far the block has been shattered at teardown. */
  shatter: number;
  /** Opacity of the code layers inside the block. */
  layers: number;
  /** 0 = layers stacked tight, 1 = exploded apart (graph build). */
  spread: number;
  /** Graph edges between layers. */
  graph: number;
  /** Scan sheet position 0..1 bottom→top; only drawn while scanOn > 0. */
  scan: number;
  scanOn: number;
  /** 0..1 how many findings are lit. */
  findings: number;
  /** Attack-path line between findings. */
  paths: number;
  /** Agent probes: 0 idle drift, 1 full attack. */
  probes: number;
  /** Findings lifted out of the glass toward the viewer (report). */
  extract: number;
  /** Block placement as a fraction of the viewport (center = 0). */
  x: number;
  y: number;
  scale: number;
  /** Camera dolly, 0 = rest, 1 = close. */
  zoom: number;
  /** Extra spin added on top of the idle rotation (radians). */
  spin: number;
  /** Normalised pointer, -1..1. Written by the DOM, damped in the scene. */
  pointerX: number;
  pointerY: number;
};

export const IDLE: SceneState = {
  assemble: 1,
  shatter: 0,
  layers: 0.85,
  spread: 0.18,
  graph: 0,
  scan: 0,
  scanOn: 0,
  findings: 0,
  paths: 0,
  probes: 0.35,
  extract: 0,
  x: 0.2,
  y: 0.02,
  scale: 1,
  zoom: 0,
  spin: 0,
  pointerX: 0,
  pointerY: 0,
};

export const scene: SceneState = { ...IDLE };

type Listener = (active: boolean) => void;
const listeners = new Set<Listener>();
let active = true;

/** Pause rendering entirely while the scene is covered by opaque sections. */
export function setSceneActive(next: boolean) {
  if (next === active) return;
  active = next;
  listeners.forEach((l) => l(next));
}

export function onSceneActive(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function isSceneActive() {
  return active;
}

