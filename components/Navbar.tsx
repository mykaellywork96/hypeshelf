"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Flame, ShieldCheck } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Authenticated top navigation bar.
 *
 * Shows the admin badge if the current user has the admin role,
 * so they know they're operating with elevated privileges.
 */
export function Navbar() {
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-white transition-colors focus-ring rounded"
        >
          <Flame className="h-5 w-5 text-violet-500 dark:text-violet-400" />
          <span className="font-semibold tracking-tight text-sm">HypeShelf</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {currentUser?.role === "admin" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20 rounded-full px-2.5 py-1">
              <ShieldCheck className="h-3 w-3" />
              Admin
            </span>
          )}
          <ThemeToggle />
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
