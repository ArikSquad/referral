'use client'

import { useConvexAuth, useQuery } from 'convex/react'

import { api } from '../../../convex/_generated/api'
import { LinkTable } from '@/components/dashboard/link-table'
import type { ManagedLink } from '@/lib/site'

export function LinksPanel({ fallback }: { fallback: ManagedLink[] }) {
    const hasDataClient = Boolean(
        (process.env.NEXT_PUBLIC_CONVEX_URL ||
            process.env.NEXT_PUBLIC_CONVEX_CLOUD_URL) &&
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    )

    if (!hasDataClient) {
        return <LinkTable links={fallback} />
    }

    return <ConnectedLinksPanel />
}

function ConnectedLinksPanel() {
    const auth = useConvexAuth()
    const links = useQuery(
        api.links.listMine,
        auth.isAuthenticated ? {} : 'skip'
    )

    if (links === undefined) {
        return (
            <div className="rounded-lg border bg-card p-8 text-sm text-muted-foreground shadow-sm">
                Loading links...
            </div>
        )
    }

    return (
        <LinkTable
            links={links.map((link) => ({
                id: link._id,
                name: link.name,
                slug: link.slug,
                destination: link.destination,
                owner: String(link.ownerId),
                status: link.status,
                clicks: link.clicks,
                lastClick: link.lastClickedAt
                    ? new Date(link.lastClickedAt).toLocaleString()
                    : 'No clicks yet',
                createdVia: link.createdVia
            }))}
        />
    )
}
