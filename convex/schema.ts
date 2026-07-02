import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    approvalStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    plan: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_user_id", ["clerkUserId"]),
  links: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    slug: v.string(),
    destination: v.string(),
    status: v.union(v.literal("live"), v.literal("paused")),
    clicks: v.number(),
    lastClickedAt: v.optional(v.number()),
    createdVia: v.union(v.literal("dashboard"), v.literal("api")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),
  clicks: defineTable({
    linkId: v.id("links"),
    ownerId: v.id("users"),
    slug: v.string(),
    ts: v.number(),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    country: v.optional(v.string()),
  })
    .index("by_link", ["linkId"])
    .index("by_owner_ts", ["ownerId", "ts"])
    .index("by_slug_ts", ["slug", "ts"]),
});
