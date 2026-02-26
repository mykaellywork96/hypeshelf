export type Genre = {
  value: string;
  label: string;
  /** Tailwind classes for the pill: bg + text */
  classes: string;
};

export const GENRES: Genre[] = [
  { value: "action",      label: "Action",      classes: "bg-orange-500/15 text-orange-300 border-orange-500/20" },
  { value: "animation",   label: "Animation",   classes: "bg-green-500/15 text-green-300 border-green-500/20" },
  { value: "comedy",      label: "Comedy",      classes: "bg-yellow-500/15 text-yellow-300 border-yellow-500/20" },
  { value: "documentary", label: "Documentary", classes: "bg-teal-500/15 text-teal-300 border-teal-500/20" },
  { value: "drama",       label: "Drama",       classes: "bg-purple-500/15 text-purple-300 border-purple-500/20" },
  { value: "fantasy",     label: "Fantasy",     classes: "bg-indigo-500/15 text-indigo-300 border-indigo-500/20" },
  { value: "horror",      label: "Horror",      classes: "bg-red-500/15 text-red-300 border-red-500/20" },
  { value: "romance",     label: "Romance",     classes: "bg-pink-500/15 text-pink-300 border-pink-500/20" },
  { value: "sci-fi",      label: "Sci-Fi",      classes: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20" },
  { value: "thriller",    label: "Thriller",    classes: "bg-rose-500/15 text-rose-300 border-rose-500/20" },
];

export const GENRE_MAP = Object.fromEntries(
  GENRES.map((g) => [g.value, g])
) as Record<string, Genre>;

/** Fallback for unknown genre values. */
export const DEFAULT_GENRE_CLASSES =
  "bg-zinc-700/50 text-zinc-300 border-zinc-600/30";
