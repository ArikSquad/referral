import { v } from 'convex/values'

import {
    mutation,
    query,
    type MutationCtx,
    type QueryCtx
} from './_generated/server'

type RecordClickArgs = {
    slug: string
    referrer?: string
    userAgent?: string
    country?: string
}

export const record = mutation({
    args: {
        slug: v.string(),
        referrer: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        country: v.optional(v.string())
    },
    handler: async (ctx: MutationCtx, args: RecordClickArgs) => {
        const link = await ctx.db
            .query('links')
            .withIndex('by_slug', (q) => q.eq('slug', args.slug))
            .unique()

        if (!link) {
            return { accepted: false, reason: 'unknown_slug' }
        }

        const now = Date.now()
        const accepted = link.status === 'live'

        await ctx.db.insert('clicks', {
            linkId: link._id,
            ownerId: link.ownerId,
            slug: args.slug,
            ts: now,
            referrer: args.referrer,
            userAgent: args.userAgent,
            country: args.country?.trim().toUpperCase()
        })

        await ctx.db.patch(link._id, {
            clicks: link.clicks + 1,
            lastClickedAt: now,
            updatedAt: now
        })

        return {
            accepted,
            reason: accepted ? undefined : 'link_paused',
            destination: accepted ? link.destination : undefined
        }
    }
})

export const recentMine = query({
    args: {},
    handler: async (ctx: QueryCtx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error('Authentication required')
        }

        return await ctx.db
            .query('clicks')
            .withIndex('by_owner_ts', (q) => q.eq('ownerId', identity.subject))
            .order('desc')
            .take(250)
    }
})

export const recent = query({
    args: {
        slug: v.optional(v.string())
    },
    handler: async (ctx: QueryCtx, args: { slug?: string }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            throw new Error('Not authenticated')
        }
        console.log('identity: %o', identity)
        if (!args.slug) {
            return await ctx.db
                .query('clicks')
                .withIndex('by_owner_ts', (q) =>
                    q.eq('ownerId', identity.subject)
                )
                .order('desc')
                .take(100)
        }

        const link = await ctx.db
            .query('links')
            .withIndex('by_slug', (q) => q.eq('slug', args.slug as string))
            .unique()

        if (!link) {
            return []
        }

        if (link.ownerId !== identity.subject) {
            throw new Error('Link owner required')
        }

        return await ctx.db
            .query('clicks')
            .withIndex('by_slug_ts', (q) => q.eq('slug', args.slug as string))
            .order('desc')
            .take(100)
    }
})
