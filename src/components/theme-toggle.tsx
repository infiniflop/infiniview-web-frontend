"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function getTheme(): Theme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, getTheme, () => null);
  const mounted = theme !== null;

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("light", next === "light");
    try {
      localStorage.setItem("theme", next);
      document.cookie = `theme=${next};domain=.infiniview.dev;path=/;max-age=31536000;samesite=lax`;
    } catch {}
  };

  const isDark = theme === "dark";
  const label = !mounted
    ? "Toggle theme"
    : isDark
      ? "Switch to light mode"
      : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex items-center justify-center w-9 h-9 border border-border-accent text-text-secondary transition-colors hover:border-lime hover:text-lime"
    >
      {/* Render an empty box on first paint to avoid hydration mismatch - the
          inline script in <head> sets the class before this component mounts. */}
      {!mounted ? (
        <span className="block w-[15px] h-[15px]" aria-hidden />
      ) : isDark ? (
        <Sun size={15} strokeWidth={1.75} aria-hidden />
      ) : (
        <Moon size={15} strokeWidth={1.75} aria-hidden />
      )}
    </button>
  );
}
