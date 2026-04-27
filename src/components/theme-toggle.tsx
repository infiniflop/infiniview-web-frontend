"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("light") ? "light" : "dark");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("light", next === "light");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage may be unavailable (private mode, etc.)
    }
    setTheme(next);
  };

  const isDark = theme === "dark";
  const label = theme === null
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
      {/* Render an empty box on first paint to avoid hydration mismatch — the
          inline script in <head> sets the class before this component mounts. */}
      {theme === null ? (
        <span className="block w-[15px] h-[15px]" aria-hidden />
      ) : isDark ? (
        <Sun size={15} strokeWidth={1.75} aria-hidden />
      ) : (
        <Moon size={15} strokeWidth={1.75} aria-hidden />
      )}
    </button>
  );
}
