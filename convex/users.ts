import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Upsert the authenticated Clerk user into the Convex users table.
 *
 * Called client-side immediately after sign-in (see components/UserSync.tsx).
 * On first sign-up, we check ADMIN_EMAILS (a comma-separated Convex env var)
 * to decide whether to grant admin or user role. Existing users keep their role.
 *
 * Security note: the clerkId always comes from ctx.auth, never from args,
 * so a caller cannot impersonate another user.
 */
export const upsertUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called upsertUser without authentication.");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) {
      // Refresh mutable profile fields on each sign-in.
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
      });
      return existing._id;
    }

    // Determine role for new users.
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const role = adminEmails.includes(args.email.toLowerCase())
      ? "admin"
      : "user";

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      role,
    });
  },
});

/**
 * Returns the full user record for the currently authenticated caller,
 * or null if not signed in / not yet synced.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});
