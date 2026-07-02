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
    affiliateIntegrationId: v.optional(v.id("affiliateIntegrations")),
    name: v.string(),
    slug: v.string(),
    destination: v.string(),
    status: v.union(
      v.literal("review"),
      v.literal("live"),
      v.literal("paused"),
      v.literal("blocked")
    ),
    mode: v.union(
      v.literal("Whitelist"),
      v.literal("Referral"),
      v.literal("Campaign"),
      v.literal("Internal")
    ),
    allowlist: v.array(v.string()),
    allowCountries: v.optional(v.array(v.string())),
    blockedCountries: v.optional(v.array(v.string())),
    accessKeyHash: v.optional(v.string()),
    affiliateNetwork: v.optional(v.string()),
    affiliateAccountId: v.optional(v.string()),
    affiliateStatus: v.optional(
      v.union(
        v.literal("not_connected"),
        v.literal("pending"),
        v.literal("connected"),
        v.literal("error")
      )
    ),
    clicks: v.number(),
    conversions: v.number(),
    revenueCents: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  affiliateIntegrations: defineTable({
    ownerId: v.id("users"),
    provider: v.union(
      v.literal("amazon-associates"),
      v.literal("custom-webhook"),
      v.literal("partner-network")
    ),
    name: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("needs_credentials"),
      v.literal("verifying"),
      v.literal("connected"),
      v.literal("error")
    ),
    trackingId: v.optional(v.string()),
    marketplace: v.optional(v.string()),
    reportingId: v.optional(v.string()),
    apiCredentialStatus: v.union(
      v.literal("missing"),
      v.literal("saved"),
      v.literal("verifying"),
      v.literal("invalid")
    ),
    webhookUrl: v.optional(v.string()),
    webhookSecretStatus: v.union(
      v.literal("missing"),
      v.literal("saved"),
      v.literal("rotating")
    ),
    eventMapping: v.optional(v.string()),
    lastSyncAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_provider", ["ownerId", "provider"]),

  clicks: defineTable({
    linkId: v.id("links"),
    slug: v.string(),
    ts: v.number(),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    country: v.optional(v.string()),
    accepted: v.boolean(),
    blockedReason: v.optional(v.string()),
    affiliateNetwork: v.optional(v.string()),
  })
    .index("by_link", ["linkId"])
    .index("by_slug_ts", ["slug", "ts"]),

  approvals: defineTable({
    clerkUserId: v.string(),
    email: v.string(),
    reason: v.string(),
    status: v.union(
      v.literal("needs_review"),
      v.literal("plan_selected"),
      v.literal("waiting_on_billing"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_status", ["status"]),
});
