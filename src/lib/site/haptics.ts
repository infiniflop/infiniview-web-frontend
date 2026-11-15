/**
 * Haptics, in one place.
 *
 * The library (web-haptics) is owned by <Haptics />, a client component that creates it on mount
 * with the official hook and destroys it on unmount. This module is the only thing the rest of the
 * site talks to: `haptic("selection")` from code, or `{...tap("medium")}` on an element.
 *
 * Everything here fails closed. On the server, before the component has mounted, on a desktop,
 * with reduced motion, with the visitor's setting off, or before the visitor has touched the page,
 * `haptic()` returns without doing anything, and the interface is complete without it: a haptic is
 * only ever the second half of something that also changes on screen.
 *
 * Nothing in this file touches `window` or `navigator` when it is imported.
 */
import type { defaultPatterns, HapticInput } from "web-haptics";

/** The library's named presets, minus `buzz` (a full second: not for an interface). */
export type Haptic = Exclude<keyof typeof defaultPatterns, "buzz">;

type Driver = (input: HapticInput) => unknown;

const KEY = "iv:haptics";
/** two haptics closer together than this are one event reported twice */
const MIN_GAP = 40;

const OUTCOME: Partial<Record<Haptic, true>> = { success: true, warning: true, error: true };

let driver: Driver | null = null;
let enabled = true;
let loud = false; // development only: let a desktop through, so the library's debug click can be heard
let last = -Infinity;
let tamed = false;
const listeners = new Set<() => void>();

const readSetting = () => {
  try {
    return window.localStorage.getItem(KEY) !== "off";
  } catch {
    return true; // private mode, blocked storage: the default is on
  }
};

/**
 * Could this device have a haptic motor? A touch screen is the test. Desktops are left out on
 * purpose: they have nothing to vibrate, and where the Vibration API is missing (Safari, Firefox)
 * the library would otherwise add its hidden switch to the page for no reason.
 */
export const hapticsCapable = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(any-pointer: coarse)").matches;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Chromium ignores (and warns about) a vibration requested before the visitor has touched the page. */
const touchedThePage = () => {
  const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  return ua ? ua.hasBeenActive : true;
};

/**
 * Where there is no Vibration API (every iOS browser), the library adds a hidden label and switch
 * to the page and clicks it. It is already `display: none`; this also takes it out of the
 * accessibility tree and the tab order by attribute, so nothing depends on that one style.
 */
const tameFallback = () => {
  if (tamed || typeof navigator.vibrate === "function") return;
  const labels = document.querySelectorAll<HTMLLabelElement>('label[for^="web-haptics-"]');
  if (!labels.length) return;
  labels.forEach((label) => {
    label.setAttribute("aria-hidden", "true");
    label.dataset.hapticsFallback = "";
    const input = label.querySelector("input");
    if (input) {
      input.tabIndex = -1;
      input.setAttribute("aria-hidden", "true");
    }
  });
  tamed = true;
};

/** <Haptics /> hands the library's `trigger` over on mount and takes it back on unmount. */
export function connectHaptics(next: Driver, options?: { loud?: boolean }) {
  driver = next;
  loud = !!options?.loud;
  tamed = false;
  enabled = readSetting();
  listeners.forEach((l) => l());
  return () => {
    if (driver === next) driver = null;
  };
}

/** The visitor's setting (on unless they turned it off). */
export const hapticsOn = () => enabled;
export const hapticsOnServer = () => true;

export function setHapticsOn(on: boolean) {
  enabled = on;
  try {
    if (on) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, "off");
  } catch {
    /* the setting then lasts for this visit only */
  }
  listeners.forEach((l) => l());
}

export function onHapticsSetting(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Fire a haptic. Call it in the same handler, at the same instant, as the visual change it belongs
 * to. Safe to call anywhere, any number of times: it is a no-op unless every gate is open.
 */
export function haptic(kind: Haptic) {
  if (!driver || typeof window === "undefined") return;
  if (!enabled || reducedMotion()) return;
  if (!loud && !hapticsCapable()) return;
  if (!touchedThePage() || document.visibilityState !== "visible") return;
  const now = performance.now();
  // one event reported twice is felt once; an outcome (the answer to what was just pressed) is
  // never the one that is dropped, however fast it arrives
  if (now - last < MIN_GAP && !OUTCOME[kind]) return;
  last = now;
  try {
    // deliberately not gated on the library's `isSupported`: that is false on iOS, where its
    // fallback is still worth attempting
    void Promise.resolve(driver(kind)).catch(() => {});
    tameFallback();
  } catch {
    /* a haptic that cannot be played is not an error */
  }
}

/**
 * For a control whose every tap changes something on screen (a link that jumps, a toggle, a primary
 * action): `<a {...tap("selection")}>`. <Haptics /> plays it on click. Controls that only sometimes
 * change something (a tab that may already be selected, a form that may be invalid) call `haptic()`
 * themselves at the moment they know.
 */
export const tap = (kind: Haptic) => ({ "data-haptic": kind }) as const;

const KINDS: Record<Haptic, true> = {
  success: true,
  warning: true,
  error: true,
  light: true,
  medium: true,
  heavy: true,
  soft: true,
  rigid: true,
  selection: true,
  nudge: true,
};
export const isHaptic = (v: string | undefined): v is Haptic => !!v && Object.hasOwn(KINDS, v);
