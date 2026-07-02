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

function normalizeSlug(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-/]+/g, "-")
    .replace(/^[-/]+|[-/]+$/g, "")
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
    const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  console.log("identity: %o", identity);

    return await ctx.db
      .query("links")
      .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
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
    const identity = await ctx.auth.getUserIdentity();
    const destination = normalizeDestination(args.destination);
    const slug = await reserveSlug(ctx, args.slug);
    const now = Date.now();

    if (!identity) {
      throw new Error("Authentication required");
    }

    const linkId = await ctx.db.insert("links", {
      ownerId: identity.subject,
      name: args.name?.trim() || nameFromDestination(destination),
      slug,
      destination,
      status: "live",
      clicks: 0,
      createdVia: "dashboard",
      createdAt: now,
      updatedAt: now,
    });
    const link = await ctx.db.get(linkId);

    if (!link) {
      throw new Error("Link could not be created");
    }

    return link;
  },
});

export const createFromApi = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    destination: v.string(),
  },
  handler: async (
    ctx: MutationCtx,
    args: CreateLinkArgs
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    const destination = normalizeDestination(args.destination);
    const slug = await reserveSlug(ctx, args.slug);
    const now = Date.now();

    if (!identity) {
      throw new Error("Authentication required");
    }

    const linkId = await ctx.db.insert("links", {
      ownerId: identity.subject,
      name: args.name?.trim() || nameFromDestination(destination),
      slug,
      destination,
      status: "live",
      clicks: 0,
      createdVia: "api",
      createdAt: now,
      updatedAt: now,
    });
    const link = await ctx.db.get(linkId);

    if (!link) {
      throw new Error("Link could not be created");
    }

    return link;
  },
});

export const pause = mutation({
  args: {
    linkId: v.id("links"),
  },
  handler: async (ctx: MutationCtx, args: { linkId: Id<"links"> }) => {
    const identity = await ctx.auth.getUserIdentity();
    const link = await ctx.db.get(args.linkId);

    if (!identity) {
      throw new Error("Authentication required");
    }

    if (!link || link.ownerId !== identity.subject) {
      throw new Error("Link owner required");
    }

    await ctx.db.patch(args.linkId, {
      status: "paused",
      updatedAt: Date.now(),
    });
  },
});
