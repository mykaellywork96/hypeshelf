"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "./ThemeProvider";

/**
 * Thin wrapper around Sonner's Toaster that syncs its theme
 * with our ThemeProvider instead of reading `prefers-color-scheme` directly.
 *
 * Placed inside <ThemeProvider> in providers.tsx so useTheme() is available.
 */
export function Toaster() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme}
      richColors
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "font-sans text-sm",
        },
      }}
    />
  );
}
