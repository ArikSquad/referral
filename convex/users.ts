import { v } from "convex/values";

import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";

export const current = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
  },
});

export const upsertCurrent = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    approvalStatus: v.optional(
      v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))
    ),
    plan: v.optional(v.string()),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      email: string;
      name?: string;
      approvalStatus?: "pending" | "approved" | "rejected";
      plan?: string;
    }
  ) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Authentication required");
    }

    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        approvalStatus: args.approvalStatus ?? existing.approvalStatus,
        plan: args.plan ?? existing.plan,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkUserId: identity.subject,
      email: args.email,
      name: args.name,
      approvalStatus: args.approvalStatus ?? "pending",
      plan: args.plan,
      createdAt: now,
      updatedAt: now,
    });
  },
});
