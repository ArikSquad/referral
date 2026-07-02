import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

function apiKeySubject(session: Awaited<ReturnType<typeof auth>>) {
    return session.orgId ?? session.userId
}

export async function GET() {
    const session = await auth()
    const subject = apiKeySubject(session)

    if (!session.isAuthenticated || !subject) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clerkClient()
    const apiKeys = await client.apiKeys.list({
        subject,
        includeInvalid: false
    })

    return NextResponse.json({
        keys: apiKeys.data.map((key) => ({
            id: key.id,
            name: key.name,
            prefix: key.secret?.slice(0, 8) ?? key.id.slice(0, 8),
            lastUsedAt: key.lastUsedAt,
            createdAt: key.createdAt,
            expiration: key.expiration
        }))
    })
}

export async function POST(request: Request) {
    const session = await auth()
    const subject = apiKeySubject(session)

    if (!session.isAuthenticated || !subject || !session.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { name?: string }

    try {
        body = await request.json()
    } catch {
        return NextResponse.json(
            { error: 'Invalid JSON body' },
            { status: 400 }
        )
    }

    const client = await clerkClient()
    const apiKey = await client.apiKeys.create({
        name: body.name?.trim() || 'API key',
        subject,
        description: 'API key for creating execv links',
        scopes: ['write:links'],
        createdBy: session.userId
    })

    return NextResponse.json(
        {
            key: {
                id: apiKey.id,
                name: apiKey.name,
                secret: apiKey.secret,
                prefix: apiKey.secret?.slice(0, 8) ?? apiKey.id.slice(0, 8),
                createdAt: apiKey.createdAt,
                expiration: apiKey.expiration
            }
        },
        { status: 201 }
    )
}
