import { NextRequest, NextResponse } from 'next/server'

import {
    getConvex,
    linkApi,
    parseJsonBody,
    requestFailed,
    requireApiKeySubject,
    serializeLink
} from '@/lib/links-api'

export async function GET() {
    const convexResult = getConvex()
    if ('error' in convexResult) {
        return convexResult.error
    }

    const authResult = await requireApiKeySubject()
    if ('error' in authResult) {
        return authResult.error
    }

    try {
        const links = await convexResult.convex.query(linkApi.listForApi, {
            clerkUserId: authResult.subjectId
        })

        return NextResponse.json({
            links: links.map(serializeLink)
        })
    } catch (error) {
        return requestFailed(error)
    }
}

export async function POST(request: NextRequest) {
    const convexResult = getConvex()
    if ('error' in convexResult) {
        return convexResult.error
    }

    const authResult = await requireApiKeySubject()
    if ('error' in authResult) {
        return authResult.error
    }

    const parsed = await parseJsonBody<{
        url?: string
        destination?: string
        slug?: string
        name?: string
    }>(request)
    if ('error' in parsed) {
        return parsed.error
    }

    const body = parsed.body
    const destination = body.destination ?? body.url

    if (!destination) {
        return NextResponse.json(
            { error: '`destination` is required' },
            { status: 400 }
        )
    }

    try {
        const link = await convexResult.convex.mutation(linkApi.createFromApi, {
            clerkUserId: authResult.subjectId,
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
            serializeLink(link),
            { status: 201 }
        )
    } catch (error) {
        return requestFailed(error)
    }
}
