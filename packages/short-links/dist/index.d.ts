export type ShortLinkStatus = 'live' | 'paused';
export type ShortLinkInput = {
    name?: string;
    slug?: string;
    destination: string;
};
export type ShortLinkUpdateInput = Partial<ShortLinkInput> & {
    status?: ShortLinkStatus;
};
export type ShortLink = {
    id: string;
    name: string;
    slug: string;
    url: string;
    destination: string;
    status: ShortLinkStatus;
    clicks: number;
    lastClickedAt?: number;
    createdAt: number;
    updatedAt: number;
};
export type ShortLinkClientOptions = {
    apiKey: string;
    baseUrl?: string;
    fetch?: typeof fetch;
};
export declare function normalizeShortLinkSlug(slug: string): string;
export declare function normalizeShortLinkDestination(destination: string): string;
export declare function nameShortLink(destination: string): string;
export declare function shortLinkUrl(slug: string, baseUrl?: string): string;
export declare function shortLinkDisplayUrl(slug: string, baseUrl?: string): string;
export declare function createShortLinkPayload(input: ShortLinkInput): {
    name: string;
    slug: string | undefined;
    destination: string;
};
export declare function updateShortLinkPayload(input: ShortLinkUpdateInput): ShortLinkUpdateInput;
export declare function createShortLinksClient(options: ShortLinkClientOptions): {
    list: () => Promise<{
        links: ShortLink[];
    }>;
    create: (input: ShortLinkInput) => Promise<ShortLink>;
    get: (id: string) => Promise<ShortLink>;
    update: (id: string, input: ShortLinkUpdateInput) => Promise<ShortLink>;
    remove: (id: string) => Promise<{
        deleted: true;
    }>;
    pause: (id: string) => Promise<ShortLink>;
    resume: (id: string) => Promise<ShortLink>;
};
//# sourceMappingURL=index.d.ts.map