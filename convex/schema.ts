import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    links: defineTable({
        ownerId: v.string(),
        name: v.string(),
        slug: v.string(),
        destination: v.string(),
        clicks: v.number(),
        lastClickedAt: v.optional(v.number()),
        createdVia: v.union(v.literal('dashboard'), v.literal('api')),
        createdAt: v.number(),
        updatedAt: v.number()
    })
        .index('by_owner', ['ownerId'])
        .index('by_slug', ['slug']),
    clicks: defineTable({
        linkId: v.id('links'),
        ownerId: v.string(),
        slug: v.string(),
        ts: v.number(),
        referrer: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        country: v.optional(v.string())
    })
        .index('by_link', ['linkId'])
        .index('by_owner_ts', ['ownerId', 'ts'])
        .index('by_slug_ts', ['slug', 'ts'])
})
