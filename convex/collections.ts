import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";

type CollectionItemInput = {
  linkId?: Id<"links">;
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  price?: string;
  merchant?: string;
  metadataStatus: "enriched" | "basic" | "failed";
};

async function requireCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Authentication required");
  }

  const existing = await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
    .unique();

  if (!existing) {
    throw new Error("Approved account required");
  }

  return existing;
}

async function requireWritableCurrentUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Authentication required");
  }

  const existing = await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
    .unique();

  if (existing) {
    return existing;
  }

  const claims = identity as unknown as {
    email?: string;
    name?: string;
    nickname?: string;
    publicMetadata?: { approvalStatus?: "pending" | "approved" | "rejected" };
  };
  const now = Date.now();
  const userId = await ctx.db.insert("users", {
    clerkUserId: identity.subject,
    email: claims.email ?? "",
    name: claims.name ?? claims.nickname,
    approvalStatus: claims.publicMetadata?.approvalStatus ?? "approved",
    createdAt: now,
    updatedAt: now,
  });
  const user = await ctx.db.get(userId);

  if (!user) {
    throw new Error("User could not be created");
  }

  return user;
}

function randomSlug() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";

  for (let index = 0; index < 7; index += 1) {
    slug += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return slug;
}

async function reserveSlug(ctx: MutationCtx) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const slug = randomSlug();
    const existingLink = await ctx.db
      .query("links")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    const existingCollection = await ctx.db
      .query("collections")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (!existingLink && !existingCollection) {
      return slug;
    }
  }

  throw new Error("Could not allocate a collection slug");
}

function normalizeUrl(url: string) {
  let parsed: URL;

  try {
    parsed = new URL(url.trim());
  } catch {
    throw new Error("Collection items must be valid URLs");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Collection items must use HTTP or HTTPS");
  }

  return parsed.toString();
}

export const listMine = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const user = await requireCurrentUser(ctx);
    const collections = await ctx.db
      .query("collections")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    return await Promise.all(
      collections.map(async (collection) => {
        const items = await ctx.db
          .query("collectionItems")
          .withIndex("by_collection", (q) => q.eq("collectionId", collection._id))
          .collect();

        return { ...collection, itemCount: items.length };
      })
    );
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    items: v.array(
      v.object({
        linkId: v.optional(v.id("links")),
        url: v.string(),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        price: v.optional(v.string()),
        merchant: v.optional(v.string()),
        metadataStatus: v.union(
          v.literal("enriched"),
          v.literal("basic"),
          v.literal("failed")
        ),
      })
    ),
  },
  handler: async (
    ctx: MutationCtx,
    args: { name: string; description?: string; items: CollectionItemInput[] }
  ) => {
    const user = await requireWritableCurrentUser(ctx);

    if (!args.name.trim()) {
      throw new Error("Collection name is required");
    }

    if (!args.items.length) {
      throw new Error("Add at least one collection item");
    }

    const now = Date.now();
    const collectionId = await ctx.db.insert("collections", {
      ownerId: user._id,
      name: args.name.trim(),
      description: args.description?.trim() || undefined,
      slug: await reserveSlug(ctx),
      status: "live",
      createdAt: now,
      updatedAt: now,
    });

    await Promise.all(
      args.items.map(async (item, position) => {
        let linkedShortUrl: string | undefined;
        let linkedTitle: string | undefined;

        if (item.linkId) {
          const link = await ctx.db.get(item.linkId);

          if (!link || link.ownerId !== user._id) {
            throw new Error("Collection link owner required");
          }

          linkedShortUrl = `/${link.slug}`;
          linkedTitle = link.name;
        }

        const url = linkedShortUrl ?? normalizeUrl(item.url);

        await ctx.db.insert("collectionItems", {
          collectionId,
          ownerId: user._id,
          linkId: item.linkId,
          url,
          title: item.title?.trim() || linkedTitle || new URL(url).hostname,
          description: item.description?.trim() || undefined,
          imageUrl: item.imageUrl?.trim() || undefined,
          price: item.price?.trim() || undefined,
          merchant: item.merchant?.trim() || undefined,
          position,
          metadataStatus: item.metadataStatus,
          createdAt: now,
          updatedAt: now,
        });
      })
    );

    return collectionId;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx: QueryCtx, args: { slug: string }) => {
    const collection = await ctx.db
      .query("collections")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!collection || collection.status !== "live") {
      return null;
    }

    const items = await ctx.db
      .query("collectionItems")
      .withIndex("by_collection", (q) => q.eq("collectionId", collection._id))
      .collect();

    const hydratedItems = await Promise.all(
      items.map(async (item) => {
        if (!item.linkId) {
          return item;
        }

        const link = await ctx.db.get(item.linkId);

        if (!link || link.status !== "live") {
          return item;
        }

        return {
          ...item,
          url: `/${link.slug}`,
          title: item.title || link.name,
          merchant: item.merchant ?? link.mode,
        };
      })
    );

    return {
      ...collection,
      items: hydratedItems.sort((a, b) => a.position - b.position),
    };
  },
});
