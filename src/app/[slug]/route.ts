import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";

import { api } from "../../../convex/_generated/api";
import { captureServerEvent } from "@/lib/posthog-server";

export const dynamic = "force-dynamic";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_CLOUD_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function displayHost(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "execv link";
  }
}

function renderCollectionPage(collection: {
  name: string;
  description?: string;
  items: Array<{
    url: string;
    title: string;
    description?: string;
    imageUrl?: string;
    price?: string;
    merchant?: string;
  }>;
}) {
  const items = collection.items
    .map((item) => {
      const image = item.imageUrl
        ? `<img src="${escapeHtml(item.imageUrl)}" alt="" loading="lazy" />`
        : `<div class="placeholder">No image</div>`;

      return `<article class="item">
        <a class="media" href="${escapeHtml(item.url)}" rel="nofollow noopener" target="_blank">${image}</a>
        <div>
          <p class="merchant">${escapeHtml(item.merchant ?? displayHost(item.url))}</p>
          <h2><a href="${escapeHtml(item.url)}" rel="nofollow noopener" target="_blank">${escapeHtml(item.title)}</a></h2>
          ${item.description ? `<p class="description">${escapeHtml(item.description)}</p>` : ""}
          <div class="meta">
            ${item.price ? `<span>${escapeHtml(item.price)}</span>` : ""}
            <a href="${escapeHtml(item.url)}" rel="nofollow noopener" target="_blank">Open</a>
          </div>
        </div>
      </article>`;
    })
    .join("");

  return `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(collection.name)}</title>
        <style>
          body { margin: 0; background: #f8fafc; color: #0f172a; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
          main { width: min(920px, calc(100% - 32px)); margin: 0 auto; padding: 48px 0; }
          header { margin-bottom: 24px; }
          h1 { margin: 0; font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1; letter-spacing: 0; }
          .lead { max-width: 680px; color: #475569; line-height: 1.7; }
          .grid { display: grid; gap: 14px; }
          .item { display: grid; grid-template-columns: 128px 1fr; gap: 18px; border: 1px solid #e2e8f0; border-radius: 8px; background: white; padding: 14px; }
          .media, .placeholder { aspect-ratio: 1 / 1; display: flex; align-items: center; justify-content: center; border-radius: 6px; background: #f1f5f9; color: #64748b; font-size: 0.8rem; overflow: hidden; }
          img { width: 100%; height: 100%; object-fit: cover; }
          .merchant { margin: 0 0 4px; color: #64748b; font-size: 0.78rem; text-transform: uppercase; }
          h2 { margin: 0; font-size: 1.05rem; }
          a { color: inherit; }
          .description { margin: 8px 0 0; color: #475569; line-height: 1.5; }
          .meta { display: flex; gap: 12px; margin-top: 12px; font-size: 0.9rem; font-weight: 600; }
          @media (max-width: 560px) { .item { grid-template-columns: 1fr; } .media, .placeholder { width: 100%; } }
        </style>
      </head>
      <body>
        <main>
          <header>
            <h1>${escapeHtml(collection.name)}</h1>
            ${collection.description ? `<p class="lead">${escapeHtml(collection.description)}</p>` : ""}
          </header>
          <section class="grid">${items}</section>
        </main>
      </body>
    </html>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!convex) {
    return NextResponse.redirect(new URL("/", request.url), 302);
  }

  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    undefined;
  const accessKey = request.nextUrl.searchParams.get("key") ?? undefined;
  const result = await convex.mutation(api.clicks.record, {
    slug,
    referrer: request.headers.get("referer") ?? undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
    country,
    accessKey,
  });

  if (!result.accepted || !result.destination) {
    if (result.reason === "unknown_slug") {
      const collection = await convex.query(api.collections.getBySlug, { slug });

      if (collection) {
        return new NextResponse(renderCollectionPage(collection), {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
    }

    const blockedUrl = new URL("/", request.url);
    blockedUrl.searchParams.set("blocked", result.reason ?? "not_allowed");
    return NextResponse.redirect(blockedUrl, 302);
  }

  await captureServerEvent("short_link_redirected", `anonymous:${slug}`, {
    slug,
    destination: result.destination,
    referrer: request.headers.get("referer"),
    userAgent: request.headers.get("user-agent"),
    country,
    affiliateStatus: result.affiliateStatus,
  });

  return NextResponse.redirect(result.destination, 302);
}
