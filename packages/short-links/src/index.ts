export type ShortLinkInput = {
    name?: string
    slug?: string
    destination: string
}

export type ShortLinkUpdateInput = Partial<ShortLinkInput>

export type ShortLink = {
    id: string
    name: string
    slug: string
    url: string
    destination: string
    clicks: number
    lastClickedAt?: number
    createdAt: number
    updatedAt: number
}

export type ShortLinkClientOptions = {
    apiKey: string
    baseUrl?: string
    fetch?: typeof fetch
}

export function normalizeShortLinkSlug(slug: string) {
    return slug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-/]+/g, '-')
        .replace(/^[-/]+|[-/]+$/g, '')
        .replace(/-{2,}/g, '-')
}

export function normalizeShortLinkDestination(destination: string) {
    let url: URL

    try {
        url = new URL(destination.trim())
    } catch {
        throw new Error('Destination must be a valid URL')
    }

    if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Destination must use HTTP or HTTPS')
    }

    return url.toString()
}

export function nameShortLink(destination: string) {
    try {
        return new URL(destination).hostname
    } catch {
        return 'Short link'
    }
}

export function shortLinkUrl(slug: string, baseUrl = 'https://execv.xyz') {
    return `${baseUrl.replace(/\/+$/u, '')}/${normalizeShortLinkSlug(slug)}`
}

export function shortLinkDisplayUrl(slug: string, baseUrl = 'https://execv.xyz') {
    return shortLinkUrl(slug, baseUrl).replace(/^https?:\/\//u, '')
}

export function createShortLinkPayload(input: ShortLinkInput) {
    const destination = normalizeShortLinkDestination(input.destination)
    const slug = input.slug ? normalizeShortLinkSlug(input.slug) : undefined
    const name = input.name?.trim() || nameShortLink(destination)

    if (input.slug && !slug) {
        throw new Error('Slug is required')
    }

    return {
        name,
        slug,
        destination
    }
}

export function updateShortLinkPayload(input: ShortLinkUpdateInput) {
    const payload: ShortLinkUpdateInput = {}

    if (input.name !== undefined) {
        payload.name = input.name.trim()
    }

    if (input.slug !== undefined) {
        const slug = normalizeShortLinkSlug(input.slug)

        if (!slug) {
            throw new Error('Slug is required')
        }

        payload.slug = slug
    }

    if (input.destination !== undefined) {
        payload.destination = normalizeShortLinkDestination(input.destination)
    }

    return payload
}

async function parseResponse<T>(response: Response): Promise<T> {
    const body = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(body?.error ?? `Request failed with ${response.status}`)
    }

    return body as T
}

export function createShortLinksClient(options: ShortLinkClientOptions) {
    const baseUrl = options.baseUrl ?? 'https://execv.xyz'
    const request = options.fetch ?? fetch
    const apiBase = `${baseUrl.replace(/\/+$/u, '')}/api/links`

    const send = async <T>(
        path: string,
        init: Omit<RequestInit, 'headers'> & { headers?: HeadersInit } = {}
    ) => {
        const headers = new Headers(init.headers)
        headers.set('authorization', `Bearer ${options.apiKey}`)

        if (init.body && !headers.has('content-type')) {
            headers.set('content-type', 'application/json')
        }

        return parseResponse<T>(
            await request(`${apiBase}${path}`, {
                ...init,
                headers
            })
        )
    }

    return {
        list: () => send<{ links: ShortLink[] }>('', { method: 'GET' }),
        create: (input: ShortLinkInput) =>
            send<ShortLink>('', {
                method: 'POST',
                body: JSON.stringify(createShortLinkPayload(input))
            }),
        get: (id: string) => send<ShortLink>(`/${id}`, { method: 'GET' }),
        update: (id: string, input: ShortLinkUpdateInput) =>
            send<ShortLink>(`/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(updateShortLinkPayload(input))
            }),
        remove: (id: string) =>
            send<{ deleted: true }>(`/${id}`, { method: 'DELETE' }),
        pause: (id: string) =>
            send<ShortLink>(`/${id}/pause`, { method: 'POST' }),
        resume: (id: string) =>
            send<ShortLink>(`/${id}/resume`, { method: 'POST' })
    }
}
