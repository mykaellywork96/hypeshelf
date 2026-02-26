"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/Toaster";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

/**
 * Root client-side providers.
 *
 * ThemeProvider manages the dark/light class on <html>.
 * ClerkProvider wraps ConvexProviderWithClerk so that Convex automatically
 * uses the Clerk JWT for all authenticated queries and mutations.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ClerkProvider>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      </ClerkProvider>
      {/* Toaster lives inside ThemeProvider so it can sync dark/light mode. */}
      <Toaster />
    </ThemeProvider>
  );
}
