"use client";

import { gsap } from "@/lib/site/gsap";

/**
 * The motion tokens (docs/redesign/motion-system.md). The CSS twins are custom properties in
 * site.css; anything animated from script takes its numbers from here.
 */
export const EASE = {
  /** arriving: fast, then it brakes */
  out: "expo.out",
  outSoft: "power3.out",
  /** moving while on screen */
  inOut: "power3.inOut",
  /** leaving: gathers speed and is gone (always shorter than the arrival) */
  in: "power3.in",
} as const;

export const DUR = {
  press: 0.12,
  hover: 0.18,
  ui: 0.24,
  open: 0.42,
  enter: 0.7,
  hero: 0.9,
  stagger: 0.06,
} as const;

export const RISE = 24;

export type SpringConfig = { stiffness: number; damping: number };

/** mass is 1 throughout, so the damping ratio is damping / (2 * sqrt(stiffness)) */
export const SPRING = {
  /** follows a hand closely and settles without wobble (ratio 0.87) */
  follow: { stiffness: 260, damping: 28 },
  /** after a throw: lands with a small overshoot (ratio 0.77) */
  release: { stiffness: 170, damping: 20 },
  /** placed by a hand: critically damped, no overshoot */
  ui: { stiffness: 420, damping: 41 },
  /** slow and heavy: light, camera-like drift */
  soft: { stiffness: 90, damping: 19 },
} as const satisfies Record<string, SpringConfig>;

const STEP = 1 / 250; // fixed 4 ms sub-step: the result does not depend on the frame rate

/**
 * One value on a spring. Giving it a new target keeps its current position and velocity, so it can
 * be interrupted and reversed at any moment; `set` jumps (used while a pointer is down, when the
 * element is the finger and nothing is animated).
 */
export class Spring {
  value: number;
  target: number;
  velocity = 0;
  config: SpringConfig;

  constructor(value = 0, config: SpringConfig = SPRING.ui) {
    this.value = value;
    this.target = value;
    this.config = config;
  }

  set(v: number) {
    this.value = v;
    this.target = v;
    this.velocity = 0;
  }

  to(target: number, config?: SpringConfig, velocity?: number) {
    this.target = target;
    if (config) this.config = config;
    if (velocity !== undefined) this.velocity = velocity;
  }

  get resting() {
    return Math.abs(this.target - this.value) < 0.01 && Math.abs(this.velocity) < 0.01;
  }

  /** advance by dt seconds; returns true while still moving */
  step(dt: number): boolean {
    if (this.resting) {
      this.value = this.target;
      this.velocity = 0;
      return false;
    }
    let left = Math.min(dt, 0.064); // a tab coming back must not fling things across the screen
    const { stiffness, damping } = this.config;
    while (left > 0) {
      const h = Math.min(STEP, left);
      const a = -stiffness * (this.value - this.target) - damping * this.velocity;
      this.velocity += a * h;
      this.value += this.velocity * h;
      left -= h;
    }
    return true;
  }
}

/**
 * Run a callback on the shared clock (GSAP's ticker) for as long as it returns true. Returns a
 * `wake` function: calling it starts the loop if it has gone to sleep. Nothing runs while every
 * spring is at rest.
 */
export function onClock(frame: (dt: number) => boolean) {
  let running = false;
  const tick = (_t: number, deltaMs: number) => {
    if (!frame(deltaMs / 1000)) {
      running = false;
      gsap.ticker.remove(tick);
    }
  };
  const wake = () => {
    if (running) return;
    running = true;
    gsap.ticker.add(tick);
  };
  const stop = () => {
    running = false;
    gsap.ticker.remove(tick);
  };
  return { wake, stop };
}

/**
 * Where a flick will come to rest: Apple's exponential-decay projection (Designing Fluid
 * Interfaces). `velocity` in px/s.
 */
export function project(velocity: number, deceleration = 0.994) {
  return ((velocity / 1000) * deceleration) / (1 - deceleration);
}

/** Past a boundary the element follows less and less: resistance, never a wall. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** A short history of pointer positions, for the velocity at release. */
export class VelocityTracker {
  private pts: { x: number; y: number; t: number }[] = [];
  add(x: number, y: number, t = performance.now()) {
    this.pts.push({ x, y, t });
    while (this.pts.length > 6) this.pts.shift();
  }
  reset() {
    this.pts.length = 0;
  }
  /** px/s over the last ~100 ms */
  get(): { x: number; y: number } {
    const n = this.pts.length;
    if (n < 2) return { x: 0, y: 0 };
    const last = this.pts[n - 1];
    let first = this.pts[0];
    for (const p of this.pts) {
      if (last.t - p.t <= 110) {
        first = p;
        break;
      }
    }
    const dt = (last.t - first.t) / 1000;
    if (dt < 0.008 || performance.now() - last.t > 90) return { x: 0, y: 0 }; // held still before letting go
    return { x: (last.x - first.x) / dt, y: (last.y - first.y) / dt };
  }
}

/**
 * A selection pill on four springs (left, top, width, height): a small piece of glass that slides to
 * whatever is selected. It keeps its velocity when the selection changes again mid-flight, and its
 * leading edge is stiffer than its trailing one, so it stretches toward where it is going and
 * gathers itself on arrival.
 */
export function createPill(pill: HTMLElement) {
  const x = new Spring(0, SPRING.ui);
  const y = new Spring(0, SPRING.ui);
  const w = new Spring(0, SPRING.ui);
  const h = new Spring(0, SPRING.ui);
  let placed = false;
  const paint = () => {
    pill.style.transform = `translate3d(${x.value.toFixed(2)}px,${y.value.toFixed(2)}px,0)`;
    pill.style.width = `${Math.max(0, w.value).toFixed(2)}px`;
    pill.style.height = `${Math.max(0, h.value).toFixed(2)}px`;
  };
  const clock = onClock((dt) => {
    const moving = [x.step(dt), y.step(dt), w.step(dt), h.step(dt)].some(Boolean);
    paint();
    return moving;
  });
  return {
    to(r: { x: number; y: number; w: number; h: number }, instant = false) {
      if (instant || !placed) {
        x.set(r.x);
        y.set(r.y);
        w.set(r.w);
        h.set(r.h);
        placed = true;
        paint();
        return;
      }
      const forward = r.x > x.target || r.y > y.target;
      x.to(r.x, forward ? SPRING.ui : SPRING.follow);
      y.to(r.y, forward ? SPRING.ui : SPRING.follow);
      w.to(r.w, forward ? SPRING.follow : SPRING.ui);
      h.to(r.h, forward ? SPRING.follow : SPRING.ui);
      clock.wake();
    },
    stop: () => clock.stop(),
  };
}
