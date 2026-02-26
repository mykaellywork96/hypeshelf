"use client";

import Image from "next/image";
import { ExternalLink, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { GENRE_MAP, DEFAULT_GENRE_CLASSES } from "@/lib/genres";
import type { Doc, Id } from "@/convex/_generated/dataModel";

export type RecWithAuthor = Doc<"recommendations"> & {
  author: Doc<"users"> | null;
};

interface RecommendationCardProps {
  rec: RecWithAuthor;
  /** Whether to show action buttons (delete, staff-pick). Omit on public feed. */
  actions?: {
    canDelete: boolean;
    isAdmin: boolean;
    onDelete: (id: Id<"recommendations">) => void;
    onToggleStaffPick: (id: Id<"recommendations">) => void;
  };
}

/**
 * Single recommendation card.
 * Used on both the public landing page and the authenticated shelf.
 */
export function RecommendationCard({ rec, actions }: RecommendationCardProps) {
  const genre = GENRE_MAP[rec.genre];
  const genreClasses = genre?.classes ?? DEFAULT_GENRE_CLASSES;
  const genreLabel = genre?.label ?? rec.genre;

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-xl border bg-gray-50 dark:bg-zinc-900 overflow-hidden",
        "transition-all duration-200 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/30",
        rec.isStaffPick
          ? "border-amber-400/50 dark:border-amber-500/40 hover:border-amber-400 dark:hover:border-amber-400"
          : "border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600"
      )}
    >
      {/* Staff Pick banner */}
      {rec.isStaffPick && (
        <div className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20">
          <Star className="h-3 w-3 text-amber-500 dark:text-amber-400 fill-current" />
          <span className="text-xs font-medium text-amber-700 dark:text-amber-300 tracking-wide uppercase">
            Staff Pick
          </span>
        </div>
      )}

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Title + link */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-zinc-100 leading-tight line-clamp-2">
            {rec.title}
          </h3>
          <a
            href={rec.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${rec.title}`}
            className="shrink-0 mt-0.5 p-1 rounded text-gray-400 dark:text-zinc-500 hover:text-violet-500 dark:hover:text-violet-400 transition-colors focus-ring"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Genre pill */}
        <span
          className={cn(
            "self-start text-xs font-medium px-2 py-0.5 rounded-full border",
            genreClasses
          )}
        >
          {genreLabel}
        </span>

        {/* Blurb */}
        <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed line-clamp-3 flex-1">
          {rec.blurb}
        </p>

        {/* Footer: author + actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800 mt-auto">
          {/* Author */}
          <div className="flex items-center gap-2 min-w-0">
            {rec.author?.imageUrl ? (
              <Image
                src={rec.author.imageUrl}
                alt={rec.author.name}
                width={20}
                height={20}
                className="rounded-full shrink-0"
              />
            ) : (
              <div className="h-5 w-5 rounded-full bg-violet-100 dark:bg-violet-600/30 flex items-center justify-center shrink-0">
                <span className="text-[10px] text-violet-600 dark:text-violet-300 font-medium">
                  {rec.author?.name?.[0]?.toUpperCase() ?? "?"}
                </span>
              </div>
            )}
            <span className="text-xs text-gray-400 dark:text-zinc-500 truncate">
              {rec.author?.name ?? "Unknown"}
            </span>
          </div>

          {/* Action buttons */}
          {actions && (
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {/* Admin: Staff Pick toggle */}
              {actions.isAdmin && (
                <button
                  onClick={() => actions.onToggleStaffPick(rec._id)}
                  title={rec.isStaffPick ? "Remove Staff Pick" : "Mark as Staff Pick"}
                  className={cn(
                    "p-1 rounded transition-colors focus-ring",
                    rec.isStaffPick
                      ? "text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300"
                      : "text-gray-300 dark:text-zinc-600 hover:text-amber-500 dark:hover:text-amber-400"
                  )}
                >
                  <Star
                    className="h-3.5 w-3.5"
                    fill={rec.isStaffPick ? "currentColor" : "none"}
                  />
                </button>
              )}

              {/* Delete (own recs or admin) */}
              {actions.canDelete && (
                <button
                  onClick={() => actions.onDelete(rec._id)}
                  title="Delete recommendation"
                  className="p-1 rounded text-gray-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors focus-ring"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/** Skeleton card for loading states. */
export function RecommendationCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 p-4 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded-full w-16 mb-3" />
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-5/6" />
        <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-4/6" />
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
        <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-zinc-800" />
        <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-24" />
      </div>
    </div>
  );
}
