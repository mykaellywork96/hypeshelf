"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type ThemeCtx = { theme: Theme; toggle: () => void };

const ThemeContext = createContext<ThemeCtx>({
  theme: "dark",
  toggle: () => {},
});

/**
 * Manages the light/dark theme.
 *
 * On mount, reads from localStorage then falls back to the OS preference.
 * Toggles the `dark` class on <html> so Tailwind's `dark:` variants apply.
 *
 * The actual class is already set before React hydrates (see the inline script
 * in app/layout.tsx), so there is no flash of the wrong theme.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    // Sync React state with whatever the inline script already applied.
    setTheme(stored ?? system);
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
