"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useWebHaptics } from "web-haptics/react";
import { connectHaptics, haptic, hapticsOn, hapticsOnServer, isHaptic, onHapticsSetting, setHapticsOn } from "@/lib/site/haptics";

/**
 * Owns the one WebHaptics instance for the marketing site. The official hook creates it when this
 * mounts (never on the server, never at module scope) and destroys it, with anything it added to
 * the page, when this unmounts. Renders nothing.
 *
 * `debug` (a click sound for each pulse, so the wiring can be checked on a laptop) exists in
 * development only, behind `localStorage["iv:haptics-debug"] = "1"`. The library's floating switch
 * is never shown: the visitor's setting is <HapticsSwitch /> in the footer.
 */
export function Haptics() {
  const debug = useSyncExternalStore(noSubscription, readDebug, () => false);
  const { trigger, cancel } = useWebHaptics({ debug, showSwitch: false });

  useEffect(() => {
    const disconnect = connectHaptics(trigger, { loud: debug });
    // controls marked with tap(): one listener for all of them, on the click itself (the moment
    // the control acts, and a real user gesture, which the platform requires)
    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-haptic]") : null;
      if (!el || el.matches(":disabled, [aria-disabled='true']")) return;
      const kind = el.dataset.haptic;
      if (isHaptic(kind)) haptic(kind);
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      cancel();
      disconnect();
    };
  }, [trigger, cancel, debug]);

  return null;
}

const noSubscription = () => () => {};
const readDebug = () => {
  if (process.env.NODE_ENV === "production") return false;
  try {
    return window.localStorage.getItem("iv:haptics-debug") === "1";
  } catch {
    return false;
  }
};

/**
 * The visitor's own setting, in the site's own interface. CSS shows it only where a haptic could
 * happen (a touch screen, motion allowed); everywhere else it is not rendered at all.
 */
export function HapticsSwitch() {
  const on = useSyncExternalStore(onHapticsSetting, hapticsOn, hapticsOnServer);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className="haptics-switch"
      onClick={() => {
        setHapticsOn(!on);
        if (!on) haptic("light"); // turning it on is felt; turning it off is, fittingly, not
      }}
    >
      <span className="haptics-switch-track" aria-hidden>
        <i />
      </span>
      Haptics
      <span className="haptics-switch-state" aria-hidden>
        {on ? "On" : "Off"}
      </span>
    </button>
  );
}
