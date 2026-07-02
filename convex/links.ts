import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";

type CreateLinkArgs = {
  name: string;
  slug: string;
  destination: string;
  mode: "Whitelist" | "Referral" | "Campaign" | "Internal";
  allowlist: string[];
  allowCountries?: string[];
  blockedCountries?: string[];
  accessKey?: string;
  affiliateIntegrationId?: Id<"affiliateIntegrations">;
  affiliateNetwork?: string;
  affiliateAccountId?: string;
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

async function requireWorkspaceAdmin(ctx: QueryCtx | MutationCtx) {
  await requireCurrentUser(ctx);
  const identity = await ctx.auth.getUserIdentity();
  const claims = identity as unknown as {
    publicMetadata?: { role?: string };
    organization_role?: string;
    org_role?: string;
  };
  const role =
    claims.publicMetadata?.role ?? claims.organization_role ?? claims.org_role;

  if (!["admin", "org:admin"].includes(role ?? "")) {
    throw new Error("Workspace admin required");
  }
}

function normalizeCountryList(countries?: string[]) {
  return (countries ?? [])
    .map((country) => country.trim().toUpperCase())
    .filter(Boolean);
}

export const listMine = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const user = await requireCurrentUser(ctx);

    return await ctx.db
      .query("links")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    destination: v.string(),
    mode: v.union(
      v.literal("Whitelist"),
      v.literal("Referral"),
      v.literal("Campaign"),
      v.literal("Internal")
    ),
    allowlist: v.array(v.string()),
    allowCountries: v.optional(v.array(v.string())),
    blockedCountries: v.optional(v.array(v.string())),
    accessKey: v.optional(v.string()),
    affiliateIntegrationId: v.optional(v.id("affiliateIntegrations")),
    affiliateNetwork: v.optional(v.string()),
    affiliateAccountId: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args: CreateLinkArgs) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db
      .query("links")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw new Error("Slug already exists");
    }

    const now = Date.now();
    let affiliateIntegration;

    if (args.affiliateIntegrationId) {
      affiliateIntegration = await ctx.db.get(args.affiliateIntegrationId);

      if (!affiliateIntegration || affiliateIntegration.ownerId !== user._id) {
        throw new Error("Integration owner required");
      }
    }

    return await ctx.db.insert("links", {
      ownerId: user._id,
      affiliateIntegrationId: args.affiliateIntegrationId,
      name: args.name,
      slug: args.slug,
      destination: args.destination,
      mode: args.mode,
      allowlist: args.allowlist,
      allowCountries: normalizeCountryList(args.allowCountries),
      blockedCountries: normalizeCountryList(args.blockedCountries),
      accessKeyHash: args.accessKey,
      affiliateNetwork: affiliateIntegration?.provider ?? args.affiliateNetwork,
      affiliateAccountId: affiliateIntegration?.trackingId ?? args.affiliateAccountId,
      affiliateStatus: affiliateIntegration ? "pending" : "not_connected",
      status: "review",
      clicks: 0,
      conversions: 0,
      revenueCents: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const approve = mutation({
  args: {
    linkId: v.id("links"),
  },
  handler: async (ctx: MutationCtx, args: { linkId: Id<"links"> }) => {
    await requireWorkspaceAdmin(ctx);

    await ctx.db.patch(args.linkId, {
      status: "live",
      updatedAt: Date.now(),
    });
  },
});
