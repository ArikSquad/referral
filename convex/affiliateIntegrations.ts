import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";

type Provider = string;

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

export const listMine = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const user = await requireCurrentUser(ctx);

    return await ctx.db
      .query("affiliateIntegrations")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();
  },
});

export const save = mutation({
  args: {
    integrationId: v.optional(v.id("affiliateIntegrations")),
    provider: v.string(),
    name: v.string(),
    trackingId: v.optional(v.string()),
    marketplace: v.optional(v.string()),
    reportingId: v.optional(v.string()),
    hasApiCredentials: v.optional(v.boolean()),
    webhookUrl: v.optional(v.string()),
    hasWebhookSecret: v.optional(v.boolean()),
    eventMapping: v.optional(v.string()),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      integrationId?: Id<"affiliateIntegrations">;
      provider: Provider;
      name: string;
      trackingId?: string;
      marketplace?: string;
      reportingId?: string;
      hasApiCredentials?: boolean;
      webhookUrl?: string;
      hasWebhookSecret?: boolean;
      eventMapping?: string;
    }
  ) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const apiCredentialStatus = args.hasApiCredentials ? "saved" : "missing";
    const webhookSecretStatus = args.hasWebhookSecret ? "saved" : "missing";
    const status =
      apiCredentialStatus === "saved" || webhookSecretStatus === "saved"
        ? "verifying"
        : "needs_credentials";

    const update = {
      provider: args.provider,
      name: args.name,
      trackingId: args.trackingId,
      marketplace: args.marketplace,
      reportingId: args.reportingId,
      apiCredentialStatus,
      webhookUrl: args.webhookUrl,
      webhookSecretStatus,
      eventMapping: args.eventMapping,
      status,
      updatedAt: now,
    } as const;

    if (args.integrationId) {
      const existing = await ctx.db.get(args.integrationId);

      if (!existing || existing.ownerId !== user._id) {
        throw new Error("Integration owner required");
      }

      await ctx.db.patch(args.integrationId, update);
      return args.integrationId;
    }

    return await ctx.db.insert("affiliateIntegrations", {
      ownerId: user._id,
      ...update,
      createdAt: now,
    });
  },
});

export const markConnected = mutation({
  args: {
    integrationId: v.id("affiliateIntegrations"),
  },
  handler: async (
    ctx: MutationCtx,
    args: { integrationId: Id<"affiliateIntegrations"> }
  ) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(args.integrationId);

    if (!existing || existing.ownerId !== user._id) {
      throw new Error("Integration owner required");
    }

    await ctx.db.patch(args.integrationId, {
      status: "connected",
      lastSyncAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
