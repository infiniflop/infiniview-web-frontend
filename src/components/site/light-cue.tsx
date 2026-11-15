"use client";

import { useEffect } from "react";
import { aimLight, setMood, type Mood } from "@/lib/site/scene";

/**
 * Aims the wall's light for a page that has no scroll scenes of its own (Pricing, the 404): behind
 * the element matched by `anchor`, or to the mood's own position when there is none.
 */
export function LightCue({ anchor, ax = 0.5, ay = 0.5, mood }: { anchor?: string; ax?: number; ay?: number; mood: Partial<Mood> }) {
  useEffect(() => {
    aimLight(anchor ? document.querySelector<HTMLElement>(anchor) : null, ax, ay);
    setMood(mood, 1.2);
    // (the next page aims the light itself; nothing to undo here)
  }, [anchor, ax, ay, mood]);
  return null;
}
