export function normalizeShortLinkSlug(slug) {
    return slug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-/]+/g, '-')
        .replace(/^[-/]+|[-/]+$/g, '')
        .replace(/-{2,}/g, '-');
}
export function normalizeShortLinkDestination(destination) {
    let url;
    try {
        url = new URL(destination.trim());
    }
    catch {
        throw new Error('Destination must be a valid URL');
    }
    if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Destination must use HTTP or HTTPS');
    }
    return url.toString();
}
export function nameShortLink(destination) {
    try {
        return new URL(destination).hostname;
    }
    catch {
        return 'Short link';
    }
}
export function shortLinkUrl(slug, baseUrl = 'https://execv.xyz') {
    return `${baseUrl.replace(/\/+$/u, '')}/${normalizeShortLinkSlug(slug)}`;
}
export function shortLinkDisplayUrl(slug, baseUrl = 'https://execv.xyz') {
    return shortLinkUrl(slug, baseUrl).replace(/^https?:\/\//u, '');
}
export function createShortLinkPayload(input) {
    const destination = normalizeShortLinkDestination(input.destination);
    const slug = input.slug ? normalizeShortLinkSlug(input.slug) : undefined;
    const name = input.name?.trim() || nameShortLink(destination);
    if (input.slug && !slug) {
        throw new Error('Slug is required');
    }
    return {
        name,
        slug,
        destination
    };
}
export function updateShortLinkPayload(input) {
    const payload = {};
    if (input.name !== undefined) {
        payload.name = input.name.trim();
    }
    if (input.slug !== undefined) {
        const slug = normalizeShortLinkSlug(input.slug);
        if (!slug) {
            throw new Error('Slug is required');
        }
        payload.slug = slug;
    }
    if (input.destination !== undefined) {
        payload.destination = normalizeShortLinkDestination(input.destination);
    }
    if (input.status !== undefined) {
        payload.status = input.status;
    }
    return payload;
}
async function parseResponse(response) {
    const body = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(body?.error ?? `Request failed with ${response.status}`);
    }
    return body;
}
export function createShortLinksClient(options) {
    const baseUrl = options.baseUrl ?? 'https://execv.xyz';
    const request = options.fetch ?? fetch;
    const apiBase = `${baseUrl.replace(/\/+$/u, '')}/api/links`;
    const send = async (path, init = {}) => {
        const headers = new Headers(init.headers);
        headers.set('authorization', `Bearer ${options.apiKey}`);
        if (init.body && !headers.has('content-type')) {
            headers.set('content-type', 'application/json');
        }
        return parseResponse(await request(`${apiBase}${path}`, {
            ...init,
            headers
        }));
    };
    return {
        list: () => send('', { method: 'GET' }),
        create: (input) => send('', {
            method: 'POST',
            body: JSON.stringify(createShortLinkPayload(input))
        }),
        get: (id) => send(`/${id}`, { method: 'GET' }),
        update: (id, input) => send(`/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updateShortLinkPayload(input))
        }),
        remove: (id) => send(`/${id}`, { method: 'DELETE' }),
        pause: (id) => send(`/${id}/pause`, { method: 'POST' }),
        resume: (id) => send(`/${id}/resume`, { method: 'POST' })
    };
}
//# sourceMappingURL=index.js.map