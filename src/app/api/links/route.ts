import { ConvexHttpClient } from 'convex/browser'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

import { api } from '../../../../convex/_generated/api'

const convexUrl =
    process.env.NEXT_PUBLIC_CONVEX_URL ??
    process.env.NEXT_PUBLIC_CONVEX_CLOUD_URL
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null

export async function POST(request: NextRequest) {
    if (!convex) {
        return NextResponse.json(
            { error: 'Convex is not configured' },
            { status: 500 }
        )
    }

    const session = await auth({ acceptsToken: 'api_key' })

    if (!session.isAuthenticated || session.tokenType !== 'api_key') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: {
        url?: string
        destination?: string
        slug?: string
        name?: string
    }

    try {
        body = await request.json()
    } catch {
        return NextResponse.json(
            { error: 'Invalid JSON body' },
            { status: 400 }
        )
    }

    const destination = body.destination ?? body.url

    if (!destination) {
        return NextResponse.json(
            { error: '`destination` is required' },
            { status: 400 }
        )
    }

    try {
        const subjectId = session.orgId ?? session.userId

        if (!subjectId) {
            return NextResponse.json(
                { error: 'API key subject is required' },
                { status: 400 }
            )
        }

        const link = await convex.mutation(api.links.createFromApi, {
            clerkUserId: subjectId,
            name: body.name,
            slug: body.slug,
            destination
        })

        if (!link) {
            return NextResponse.json(
                { error: 'Link could not be created' },
                { status: 500 }
            )
        }

        return NextResponse.json(
            {
                id: link._id,
                slug: link.slug,
                url: `https://execv.xyz/${link.slug}`,
                destination: link.destination,
                createdAt: link.createdAt
            },
            { status: 201 }
        )
    } catch (error) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Request failed'
            },
            { status: 400 }
        )
    }
}
