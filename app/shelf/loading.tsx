import { RecommendationCardSkeleton } from "@/components/RecommendationCard";

/**
 * Next.js App Router loading UI for the /shelf route.
 * Shown immediately while the server component shell streams in,
 * before the client-side Convex queries resolve.
 */
export default function ShelfLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar skeleton */}
      <div className="h-14 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950" />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-7 w-28 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-36 bg-gray-100 dark:bg-zinc-800/60 rounded mt-2 animate-pulse" />
          </div>
          <div className="h-9 w-44 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
        </div>

        {/* Filter skeleton */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-16 bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse"
            />
          ))}
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <RecommendationCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
