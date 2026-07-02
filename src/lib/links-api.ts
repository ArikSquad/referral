import 'server-only'

import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import type { GenericId } from 'convex/values'
import { NextResponse } from 'next/server'

import { shortLinkUrl } from '@execv/short-links'

import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null

type LinkRecord = {
    _id: GenericId<'links'>
    name: string
    slug: string
    destination: string
    clicks: number
    lastClickedAt?: number
    createdAt: number
    updatedAt: number
}

export async function requireApiKeySubject() {
    const session = await auth({ acceptsToken: 'api_key' })

    if (!session.isAuthenticated || session.tokenType !== 'api_key') {
        return {
            error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    const subjectId = session.orgId ?? session.userId

    if (!subjectId) {
        return {
            error: NextResponse.json(
                { error: 'API key subject is required' },
                { status: 400 }
            )
        }
    }

    return { subjectId }
}

export function getConvex() {
    if (!convex) {
        return {
            error: NextResponse.json(
                { error: 'Convex is not configured' },
                { status: 500 }
            )
        }
    }

    return { convex }
}

export function serializeLink(link: LinkRecord) {
    return {
        id: link._id,
        name: link.name,
        slug: link.slug,
        url: shortLinkUrl(link.slug),
        destination: link.destination,
        clicks: link.clicks,
        lastClickedAt: link.lastClickedAt,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt
    }
}

export async function parseJsonBody<T>(request: Request) {
    try {
        return { body: (await request.json()) as T }
    } catch {
        return {
            error: NextResponse.json(
                { error: 'Invalid JSON body' },
                { status: 400 }
            )
        }
    }
}

export function requestFailed(error: unknown, status = 400) {
    return NextResponse.json(
        {
            error: error instanceof Error ? error.message : 'Request failed'
        },
        { status }
    )
}

export const linkApi = api.links

export function linkIdFromRouteParam(linkId: string) {
    return linkId as Id<'links'>
}
