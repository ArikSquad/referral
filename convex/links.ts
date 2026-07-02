import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";

type CreateLinkArgs = {
  name?: string;
  slug?: string;
  destination: string;
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
  const user = await getExistingCurrentUser(ctx);

  if (!user || user.approvalStatus !== "approved") {
    throw new Error("Approved account required");
  }

  return user;
}

async function requireWritableCurrentUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Authentication required");
  }

  const existing = await getExistingCurrentUser(ctx);

  if (existing) {
    if (existing.approvalStatus !== "approved") {
      throw new Error("Approved account required");
    }

    return existing;
  }

  const claims = identity as unknown as {
    email?: string;
    name?: string;
    nickname?: string;
    publicMetadata?: { approvalStatus?: "pending" | "approved" | "rejected" };
  };
  const approvalStatus = claims.publicMetadata?.approvalStatus ?? "approved";

  if (approvalStatus !== "approved") {
    throw new Error("Approved account required");
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
  if (requestedSlug) {
    const slug = normalizeSlug(requestedSlug);

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

function normalizeDestination(destination: string) {
  let url: URL;

  try {
    url = new URL(destination.trim());
  } catch {
    throw new Error("Destination must be a valid URL");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Destination must use HTTP or HTTPS");
  }

  return url.toString();
}

function nameFromDestination(destination: string) {
  try {
    return new URL(destination).hostname;
  } catch {
    return "Short link";
  }
}

export const listMine = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const user = await requireCurrentUser(ctx);

    return await ctx.db
      .query("links")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    destination: v.string(),
  },
  handler: async (ctx: MutationCtx, args: CreateLinkArgs) => {
    const user = await requireWritableCurrentUser(ctx);
    const destination = normalizeDestination(args.destination);
    const slug = await reserveSlug(ctx, args.slug);
    const now = Date.now();

    return await ctx.db.insert("links", {
      ownerId: user._id,
      name: args.name?.trim() || nameFromDestination(destination),
      slug,
      destination,
      status: "live",
      clicks: 0,
      createdVia: "dashboard",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const pause = mutation({
  args: {
    linkId: v.id("links"),
  },
  handler: async (ctx: MutationCtx, args: { linkId: Id<"links"> }) => {
    const user = await requireCurrentUser(ctx);
    const link = await ctx.db.get(args.linkId);

    if (!link || link.ownerId !== user._id) {
      throw new Error("Link owner required");
    }

    await ctx.db.patch(args.linkId, {
      status: "paused",
      updatedAt: Date.now(),
    });
  },
});
