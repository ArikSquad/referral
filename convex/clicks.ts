import { v } from "convex/values";

import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";

type RecordClickArgs = {
  slug: string;
  referrer?: string;
  userAgent?: string;
  country?: string;
};

async function requireCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Authentication required");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
    .unique();

  if (!user || user.approvalStatus !== "approved") {
    throw new Error("Approved account required");
  }

  return user;
}

export const record = mutation({
  args: {
    slug: v.string(),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args: RecordClickArgs) => {
    const link = await ctx.db
      .query("links")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!link) {
      return { accepted: false, reason: "unknown_slug" };
    }

    const now = Date.now();
    const accepted = link.status === "live";

    await ctx.db.insert("clicks", {
      linkId: link._id,
      ownerId: link.ownerId,
      slug: args.slug,
      ts: now,
      referrer: args.referrer,
      userAgent: args.userAgent,
      country: args.country?.trim().toUpperCase(),
    });

    await ctx.db.patch(link._id, {
      clicks: link.clicks + 1,
      lastClickedAt: now,
      updatedAt: now,
    });

    return {
      accepted,
      reason: accepted ? undefined : "link_paused",
      destination: accepted ? link.destination : undefined,
    };
  },
});

export const recentMine = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const user = await requireCurrentUser(ctx);

    return await ctx.db
      .query("clicks")
      .withIndex("by_owner_ts", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .take(250);
  },
});

export const recent = query({
  args: {
    slug: v.optional(v.string()),
  },
  handler: async (ctx: QueryCtx, args: { slug?: string }) => {
    const user = await requireCurrentUser(ctx);

    if (!args.slug) {
      return await ctx.db
        .query("clicks")
        .withIndex("by_owner_ts", (q) => q.eq("ownerId", user._id))
        .order("desc")
        .take(100);
    }

    const link = await ctx.db
      .query("links")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug as string))
      .unique();

    if (!link) {
      return [];
    }

    if (link.ownerId !== user._id) {
      throw new Error("Link owner required");
    }

    return await ctx.db
      .query("clicks")
      .withIndex("by_slug_ts", (q) => q.eq("slug", args.slug as string))
      .order("desc")
      .take(100);
  },
});
