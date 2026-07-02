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
  slug?: string;
  destination: string;
  mode: "Whitelist" | "Referral" | "Campaign" | "Internal";
  allowlist: string[];
  allowCountries?: string[];
  blockedCountries?: string[];
  accessKey?: string;
  affiliateIntegrationId?: Id<"affiliateIntegrations">;
  affiliateNetwork?: string;
  affiliateAccountId?: string;
  startsAt?: number;
  expiresAt?: number;
};

async function getExistingCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Authentication required");
  }

  return await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
    .unique();
}

async function requireCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Authentication required");
  }

  const existing = await getExistingCurrentUser(ctx);

  const claims = identity as unknown as {
    email?: string;
    name?: string;
    nickname?: string;
    publicMetadata?: { approvalStatus?: "pending" | "approved" | "rejected" };
  };
  const approvalStatus =
    existing?.approvalStatus ?? claims.publicMetadata?.approvalStatus ?? "approved";

  if (approvalStatus !== "approved") {
    throw new Error("Approved account required");
  }

  if (existing) {
    return existing;
  }

  throw new Error("Approved account required");
}

async function requireWritableCurrentUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Authentication required");
  }

  const existing = await getExistingCurrentUser(ctx);
  const claims = identity as unknown as {
    email?: string;
    name?: string;
    nickname?: string;
    publicMetadata?: { approvalStatus?: "pending" | "approved" | "rejected" };
  };
  const approvalStatus =
    existing?.approvalStatus ?? claims.publicMetadata?.approvalStatus ?? "approved";

  if (approvalStatus !== "approved") {
    throw new Error("Approved account required");
  }

  if (existing) {
    return existing;
  }

  const now = Date.now();
  const userId = await ctx.db.insert("users", {
    clerkUserId: identity.subject,
    email: claims.email ?? "",
    name: claims.name ?? claims.nickname,
    approvalStatus,
    createdAt: now,
    updatedAt: now,
  });

  const user = await ctx.db.get(userId);

  if (!user) {
    throw new Error("User could not be created");
  }

  return user;
}

async function isApplicationStaff(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  const claims = identity as unknown as {
    publicMetadata?: { role?: string };
    privateMetadata?: { role?: string };
    metadata?: { role?: string };
    organization_role?: string;
    org_role?: string;
  };
  const role =
    claims.publicMetadata?.role ??
    claims.privateMetadata?.role ??
    claims.metadata?.role ??
    claims.organization_role ??
    claims.org_role;

  return role === "staff";
}

async function requireWorkspaceAdmin(ctx: QueryCtx | MutationCtx) {
  await requireCurrentUser(ctx);

  if (!(await isApplicationStaff(ctx))) {
    throw new Error("Application staff required");
  }
}

function normalizeCountryList(countries?: string[]) {
  return (countries ?? [])
    .map((country) => country.trim().toUpperCase())
    .filter(Boolean);
}

function normalizeSlug(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function randomSlug() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";

  for (let index = 0; index < 7; index += 1) {
    slug += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return slug;
}

async function reserveSlug(ctx: MutationCtx, requestedSlug?: string) {
  const canChooseSlug = await isApplicationStaff(ctx);

  if (canChooseSlug) {
    const slug = normalizeSlug(requestedSlug ?? "");

    if (!slug) {
      throw new Error("Slug is required");
    }

    const existing = await ctx.db
      .query("links")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (existing) {
      throw new Error("Slug already exists");
    }

    return slug;
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const slug = randomSlug();
    const existing = await ctx.db
      .query("links")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (!existing) {
      return slug;
    }
  }

  throw new Error("Could not allocate a short slug");
}

function normalizeDestination(
  destination: string,
  args: Omit<CreateLinkArgs, "slug"> & { slug: string }
) {
  let url: URL;

  try {
    url = new URL(destination.trim());
  } catch {
    throw new Error("Destination must be a valid URL");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Destination must use HTTP or HTTPS");
  }

  const hasAffiliateTracking =
    Boolean(args.affiliateIntegrationId) ||
    Boolean(args.affiliateNetwork?.trim()) ||
    Boolean(args.affiliateAccountId?.trim());

  if (!hasAffiliateTracking) {
    const defaults = {
      utm_source: "execv",
      utm_medium: args.mode.toLowerCase(),
      utm_campaign: args.slug,
      utm_content: args.name,
    };

    for (const [key, value] of Object.entries(defaults)) {
      if (!url.searchParams.has(key)) {
        url.searchParams.set(key, value);
      }
    }
  }

  return url.toString();
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

export const capabilities = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    await requireCurrentUser(ctx);

    return {
      canChooseSlug: await isApplicationStaff(ctx),
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
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
    startsAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx: MutationCtx, args: CreateLinkArgs) => {
    const user = await requireWritableCurrentUser(ctx);
    const slug = await reserveSlug(ctx, args.slug);

    const now = Date.now();
    let affiliateIntegration;

    if (args.startsAt && args.expiresAt && args.startsAt >= args.expiresAt) {
      throw new Error("Expiration date must be after start date");
    }

    if (args.affiliateIntegrationId) {
      affiliateIntegration = await ctx.db.get(args.affiliateIntegrationId);

      if (!affiliateIntegration || affiliateIntegration.ownerId !== user._id) {
        throw new Error("Integration owner required");
      }
    }

    return await ctx.db.insert("links", {
      ownerId: user._id,
      affiliateIntegrationId: args.affiliateIntegrationId,
      name: args.name.trim(),
      slug,
      destination: normalizeDestination(args.destination, { ...args, slug }),
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
      startsAt: args.startsAt,
      expiresAt: args.expiresAt,
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
