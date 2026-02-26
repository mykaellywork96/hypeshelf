import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Two-table schema:
 *
 * `users`           – synced from Clerk on every sign-in; holds role.
 * `recommendations` – the core content; references users by internal Id.
 *
 * Roles live here (server-side) rather than in Clerk metadata so all
 * role checks happen inside Convex mutations where they can't be spoofed.
 */
export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("user")),
  }).index("by_clerk_id", ["clerkId"]),

  recommendations: defineTable({
    title: v.string(),
    genre: v.string(),
    link: v.string(),
    blurb: v.string(),
    userId: v.id("users"),
    isStaffPick: v.boolean(),
  })
    .index("by_genre", ["genre"])
    .index("by_user", ["userId"])
    .index("by_staff_pick", ["isStaffPick"]),
});
