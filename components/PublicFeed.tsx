"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RecommendationCard, RecommendationCardSkeleton } from "./RecommendationCard";
import { BookOpen } from "lucide-react";

/**
 * Read-only feed of the latest 10 recommendations for the public landing page.
 * Uses Convex's reactive query — updates in real-time if new picks are added.
 */
export function PublicFeed() {
  const recs = useQuery(api.recommendations.getLatest);

  if (recs === undefined) {
    // Loading state
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <RecommendationCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (recs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BookOpen className="h-10 w-10 text-zinc-700 mb-4" />
        <p className="text-zinc-500 text-sm">No picks yet. Be the first to add one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
      {recs.map((rec) => (
        <RecommendationCard key={rec._id} rec={rec} />
      ))}
    </div>
  );
}
