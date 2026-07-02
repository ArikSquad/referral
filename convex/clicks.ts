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
  accessKey?: string;
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

  const claims = identity as unknown as {
    publicMetadata?: { role?: string };
    organization_role?: string;
    org_role?: string;
  };
  const role =
    claims.publicMetadata?.role ?? claims.organization_role ?? claims.org_role;

  return {
    user,
    isAdmin: ["admin", "org:admin"].includes(role ?? ""),
  };
}

export const record = mutation({
  args: {
    slug: v.string(),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    country: v.optional(v.string()),
    accessKey: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args: RecordClickArgs) => {
    const link = await ctx.db
      .query("links")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!link) {
      return { accepted: false, reason: "unknown_slug" };
    }

    const country = args.country?.trim().toUpperCase();
    const allowCountries = link.allowCountries ?? [];
    const blockedCountries = link.blockedCountries ?? [];
    const countryAllowed =
      !country ||
      (allowCountries.length === 0 || allowCountries.includes(country)) &&
        !blockedCountries.includes(country);
    const keyAllowed =
      !link.accessKeyHash || link.accessKeyHash === args.accessKey;
    const accepted = link.status === "live" && countryAllowed && keyAllowed;
    const blockedReason =
      link.status !== "live"
        ? `link_${link.status}`
        : !countryAllowed
          ? "country_blocked"
          : !keyAllowed
            ? "access_key_required"
            : undefined;

    await ctx.db.insert("clicks", {
      linkId: link._id,
      slug: args.slug,
      ts: Date.now(),
      referrer: args.referrer,
      userAgent: args.userAgent,
      country,
      accepted,
      blockedReason,
      affiliateNetwork: link.affiliateNetwork,
    });

    await ctx.db.patch(link._id, {
      clicks: link.clicks + 1,
      updatedAt: Date.now(),
    });

    return {
      accepted,
      reason: blockedReason,
      destination: accepted ? link.destination : undefined,
      affiliateStatus: link.affiliateStatus ?? "not_connected",
    };
  },
});

export const recent = query({
  args: {
    slug: v.optional(v.string()),
  },
  handler: async (ctx: QueryCtx, args: { slug?: string }) => {
    const { user, isAdmin } = await requireCurrentUser(ctx);

    if (args.slug) {
      const link = await ctx.db
        .query("links")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug as string))
        .unique();

      if (!link) {
        return [];
      }

      if (!isAdmin && link.ownerId !== user._id) {
        throw new Error("Link owner or workspace admin required");
      }

      return await ctx.db
        .query("clicks")
        .withIndex("by_slug_ts", (q) => q.eq("slug", args.slug as string))
        .order("desc")
        .take(100);
    }

    if (!isAdmin) {
      throw new Error("Workspace admin required");
    }

    return await ctx.db.query("clicks").order("desc").take(100);
  },
});
