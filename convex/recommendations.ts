import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Protocols that are safe to store and render as external links.
 * Defined here (not imported) so this file stays self-contained for
 * Convex's bundler. The same logic lives in lib/validateLink.ts for tests.
 */
const ALLOWED_LINK_PROTOCOLS = ["http:", "https:"];

/**
 * Valid genre values — must stay in sync with lib/genres.ts.
 * Defined inline for the same bundler-safety reason above.
 */
const VALID_GENRES = new Set([
  "action", "animation", "comedy", "documentary", "drama",
  "fantasy", "horror", "romance", "sci-fi", "thriller",
]);

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Validate a user-supplied URL.
 * Throws a descriptive error rather than silently storing a bad value.
 * (Same logic as lib/validateLink.ts — duplicated here for bundler safety.)
 */
function validateLink(raw: string): string {
  const trimmed = raw.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(
      "Invalid URL. Make sure it starts with https:// or http://"
    );
  }

  if (!ALLOWED_LINK_PROTOCOLS.includes(parsed.protocol)) {
    throw new Error(
      `URLs must use http or https. Received: "${parsed.protocol}"`
    );
  }

  return trimmed;
}

/** Attach the author's user record to each recommendation. */
async function withAuthor(
  ctx: { db: { get: (id: Id<"users">) => Promise<Doc<"users"> | null> } },
  recs: Doc<"recommendations">[]
) {
  return Promise.all(
    recs.map(async (rec) => {
      const author = await ctx.db.get(rec.userId);
      return { ...rec, author };
    })
  );
}

// ─── Public queries ───────────────────────────────────────────────────────────

/**
 * Fetch the 10 most recent recommendations for the public landing page.
 * No authentication required — intentionally read-only.
 */
export const getLatest = query({
  args: {},
  handler: async (ctx) => {
    const recs = await ctx.db
      .query("recommendations")
      .order("desc")
      .take(10);

    return withAuthor(ctx, recs);
  },
});

// ─── Authenticated queries ────────────────────────────────────────────────────

/**
 * Fetch recommendations with cursor-based pagination, optionally filtered by genre.
 *
 * Using Convex's built-in paginate() so the result set stays bounded at scale.
 * The client uses usePaginatedQuery() which accumulates pages automatically.
 *
 * Requires authentication.
 */
export const getAll = query({
  args: {
    genre: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { genre, paginationOpts }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Reject unknown genre values against the canonical list.
    if (genre !== undefined && !VALID_GENRES.has(genre)) {
      throw new Error(`Invalid genre: "${genre}".`);
    }

    // Build the base query — indexed by genre when filtering, otherwise full scan.
    const baseQuery = genre
      ? ctx.db
          .query("recommendations")
          .withIndex("by_genre", (q) => q.eq("genre", genre))
          .order("desc")
      : ctx.db.query("recommendations").order("desc");

    const result = await baseQuery.paginate(paginationOpts);

    // Hydrate each page item with its author record.
    const page = await withAuthor(ctx, result.page);

    return { ...result, page };
  },
});

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Add a new recommendation.
 *
 * Validates inputs server-side — client validation is UX sugar,
 * server validation is the actual security gate.
 *
 * Any authenticated user may call this.
 */
export const add = mutation({
  args: {
    title: v.string(),
    genre: v.string(),
    link: v.string(),
    blurb: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // ── Server-side validation ─────────────────────────────────────
    if (!args.title.trim()) throw new Error("Title is required.");
    if (args.title.trim().length > 120) throw new Error("Title must be 120 characters or fewer.");

    if (!args.genre.trim()) throw new Error("Genre is required.");
    if (!VALID_GENRES.has(args.genre)) throw new Error(`Invalid genre: "${args.genre}".`);

    const safeLink = validateLink(args.link); // throws on bad URL

    if (!args.blurb.trim()) throw new Error("Blurb is required.");
    if (args.blurb.trim().length > 300) throw new Error("Blurb must be 300 characters or fewer.");
    // ──────────────────────────────────────────────────────────────

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User record not found. Please refresh and try again.");
    }

    await ctx.db.insert("recommendations", {
      title: args.title.trim(),
      genre: args.genre.trim(),
      link: safeLink,
      blurb: args.blurb.trim(),
      userId: user._id,
      isStaffPick: false,
    });
  },
});

/**
 * Delete a recommendation.
 *
 * RBAC:
 * - `admin` can delete any recommendation.
 * - `user` can only delete their own.
 */
export const remove = mutation({
  args: { id: v.id("recommendations") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const [user, rec] = await Promise.all([
      ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique(),
      ctx.db.get(id),
    ]);

    if (!user) throw new Error("User not found.");
    if (!rec) throw new Error("Recommendation not found.");

    const isOwner = rec.userId === user._id;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error("Forbidden: you can only delete your own recommendations.");
    }

    await ctx.db.delete(id);
  },
});

/**
 * Toggle the Staff Pick flag on a recommendation.
 *
 * RBAC: admin only.
 */
export const toggleStaffPick = mutation({
  args: { id: v.id("recommendations") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Forbidden: Staff Pick is an admin-only action.");
    }

    const rec = await ctx.db.get(id);
    if (!rec) throw new Error("Recommendation not found.");

    await ctx.db.patch(id, { isStaffPick: !rec.isStaffPick });
  },
});
