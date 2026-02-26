"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

/**
 * Icon button that toggles between light and dark mode.
 * Placed in the Navbar so it's accessible from every page.
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "p-2 rounded-lg transition-colors focus-ring",
        "text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200",
        "hover:bg-gray-100 dark:hover:bg-zinc-800"
      )}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
