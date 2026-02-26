"use client";

import { cn } from "@/lib/utils";
import { GENRES } from "@/lib/genres";

interface GenreFilterProps {
  value: string | null;
  onChange: (genre: string | null) => void;
}

/**
 * Horizontal filter tab strip for genres.
 * "All" resets the filter; each genre pill filters the shelf.
 */
export function GenreFilter({ value, onChange }: GenreFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {/* All pill */}
      <button
        onClick={() => onChange(null)}
        className={cn(
          "shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors focus-ring",
          value === null
            ? "bg-violet-600 border-violet-600 text-white"
            : "bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:border-gray-400 dark:hover:border-zinc-600"
        )}
      >
        All
      </button>

      {GENRES.map((genre) => (
        <button
          key={genre.value}
          onClick={() => onChange(genre.value)}
          className={cn(
            "shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors focus-ring",
            value === genre.value
              ? "bg-violet-600 border-violet-600 text-white"
              : "bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:border-gray-400 dark:hover:border-zinc-600"
          )}
        >
          {genre.label}
        </button>
      ))}
    </div>
  );
}
