"use client";

/**
 * The first screen arrives as one piece.
 *
 * The page's opening shot is the corridor plus the headline, nav and form. If each starts the moment its
 * own code is ready, the visitor sees text over a black screen, then a background that pops in under
 * text that is already moving. Instead the entrance waits for two things (the web font, and the
 * corridor's first drawn frame, or the knowledge that there will be none) and then everything plays
 * together. Waiting is capped, so a slow or failed GPU never holds the page back.
 */
type Part = "corridor" | "fonts";

const done: Record<Part, boolean> = { corridor: false, fonts: false };
const waiters = new Set<() => void>();
let fired = false;

function fire() {
  if (fired) return;
  fired = true;
  if (typeof document !== "undefined") document.documentElement.dataset.firstScreen = "ready";
  const run = [...waiters];
  waiters.clear();
  run.forEach((fn) => fn());
}

/** A part of the first screen is ready (or has failed in a way that means it will not be coming). */
export function markReady(part: Part) {
  done[part] = true;
  if (done.corridor && done.fonts) fire();
}

export const firstScreenIsReady = () => fired;

/**
 * Run `cb` once the first screen is ready, or after `maxWait` ms, whichever is first. Returns a cancel
 * function. Callbacks are run from a frame, never inside the caller's own task.
 */
export function whenFirstScreen(cb: () => void, maxWait = 1600): () => void {
  let live = true;
  let timer = 0;
  let raf = 0;
  const go = () => {
    if (!live) return;
    live = false;
    window.clearTimeout(timer);
    waiters.delete(wrapped);
    raf = requestAnimationFrame(cb);
  };
  const wrapped = () => go();
  if (fired) go();
  else {
    waiters.add(wrapped);
    timer = window.setTimeout(go, maxWait);
  }
  return () => {
    live = false;
    window.clearTimeout(timer);
    cancelAnimationFrame(raf);
    waiters.delete(wrapped);
  };
}

if (typeof window !== "undefined") {
  // fonts: by the time this module runs the preloaded face has been requested; wait for it to land
  const fonts = document.fonts;
  if (fonts?.ready) {
    requestAnimationFrame(() => fonts.ready.then(() => markReady("fonts"), () => markReady("fonts")));
  } else {
    markReady("fonts");
  }
}
