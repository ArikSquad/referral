import 'server-only'

import { auth, clerkClient } from '@clerk/nextjs/server'
import { cacheLife } from 'next/cache'

export type ApiKeyListItem = {
    id: string
    name: string
    prefix: string
    lastUsedAt: number | null
}

function apiKeySubject(session: Awaited<ReturnType<typeof auth>>) {
    return session.orgId ?? session.userId
}

export async function getApiKeys(): Promise<ApiKeyListItem[]> {
    'use cache: private'
    cacheLife({ stale: 60 })

    const session = await auth()
    const subject = apiKeySubject(session)

    if (!session.isAuthenticated || !subject) {
        return []
    }

    const client = await clerkClient()
    const apiKeys = await client.apiKeys.list({
        subject,
        includeInvalid: false
    })

    return apiKeys.data.map((key) => ({
        id: key.id,
        name: key.name,
        prefix: key.secret?.slice(0, 8) ?? key.id.slice(0, 8),
        lastUsedAt: key.lastUsedAt
    }))
}
