import Link from "next/link";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Flame } from "lucide-react";
import { PublicFeed } from "@/components/PublicFeed";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Public landing page.
 *
 * - Visible to everyone (no auth required).
 * - Shows the HypeShelf brand, tagline, and a live preview of the latest picks.
 * - Signed-out visitors see a CTA to sign in; signed-in visitors go straight to shelf.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="border-b border-gray-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-violet-500 dark:text-violet-400" />
            <span className="font-semibold text-gray-900 dark:text-zinc-100 tracking-tight">
              HypeShelf
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-white transition-colors focus-ring rounded-md px-3 py-1.5">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <Link
                href="/shelf"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-white transition-colors focus-ring rounded-md px-3 py-1.5"
              >
                My shelf →
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-full px-4 py-1.5 text-violet-600 dark:text-violet-300 text-xs font-medium mb-8 tracking-wide uppercase">
          <Flame className="h-3.5 w-3.5" />
          Beta
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight max-w-2xl leading-[1.1]">
          Collect and share{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400">
            the stuff you&apos;re hyped about.
          </span>
        </h1>

        <p className="mt-6 text-lg text-gray-500 dark:text-zinc-400 max-w-md leading-relaxed">
          A shared shelf where you and your friends log your favourite movies —
          no algorithms, no noise.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-medium px-5 py-2.5 rounded-lg transition-colors focus-ring text-sm">
                Sign in to add yours
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link
              href="/shelf"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-medium px-5 py-2.5 rounded-lg transition-colors focus-ring text-sm"
            >
              Open my shelf →
            </Link>
          </SignedIn>

          <a
            href="#latest"
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 font-medium px-5 py-2.5 rounded-lg transition-colors focus-ring text-sm border border-gray-200 dark:border-zinc-700"
          >
            Browse picks
          </a>
        </div>
      </section>

      {/* ── Latest picks (live from Convex) ──────────────────────── */}
      <section id="latest" className="flex-1 max-w-5xl mx-auto w-full px-6 pb-24">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Latest picks</h2>
          <span className="h-px flex-1 bg-gray-200 dark:bg-zinc-800" />
          <span className="text-xs text-gray-400 dark:text-zinc-500">read-only preview</span>
        </div>

        <PublicFeed />
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 dark:border-zinc-800 py-6 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400 dark:text-zinc-600">
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-gray-300 dark:text-zinc-700" />
            <span>HypeShelf</span>
          </div>
          <span>Built with Next.js · Convex · Clerk</span>
        </div>
      </footer>
    </div>
  );
}
