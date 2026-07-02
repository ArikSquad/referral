import { siteConfig } from '@/lib/site'

export type ShortLinkInput = {
    name?: string
    slug?: string
    destination: string
}

export type ShortLinkUpdateInput = Partial<ShortLinkInput>

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

export function shortLinkUrl(slug: string) {
    return `${siteConfig.url}/${normalizeShortLinkSlug(slug)}`
}

export function shortLinkDisplayUrl(slug: string) {
    return shortLinkUrl(slug).replace(/^https?:\/\//, '')
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
