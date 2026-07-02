export {
    createShortLinkPayload,
    nameShortLink,
    normalizeShortLinkDestination,
    normalizeShortLinkSlug,
    updateShortLinkPayload,
    type ShortLinkInput,
    type ShortLinkUpdateInput
} from '@execv/short-links'

import { shortLinkDisplayUrl as displayUrl } from '@execv/short-links'
import { shortLinkUrl as linkUrl } from '@execv/short-links'

import { siteConfig } from '@/lib/site'

export function shortLinkUrl(slug: string) {
    return linkUrl(slug, siteConfig.url)
}

export function shortLinkDisplayUrl(slug: string) {
    return displayUrl(slug, siteConfig.url)
}
