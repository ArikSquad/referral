import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type MetadataResult = {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  price?: string;
  merchant?: string;
  metadataStatus: "enriched" | "basic" | "failed";
};

function firstMatch(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      return decodeHtml(match[1].trim());
    }
  }

  return undefined;
}

function decodeHtml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function absoluteUrl(value: string | undefined, base: string) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value, base).toString();
  } catch {
    return undefined;
  }
}

function jsonLdProducts(html: string) {
  const scripts = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );

  for (const script of scripts) {
    try {
      const parsed = JSON.parse(script[1].trim());
      const candidates = Array.isArray(parsed) ? parsed : [parsed];

      for (const candidate of candidates) {
        const graph = Array.isArray(candidate?.["@graph"]) ? candidate["@graph"] : [candidate];
        const product = graph.find((item: { "@type"?: string | string[] }) => {
          const type = item?.["@type"];
          return Array.isArray(type) ? type.includes("Product") : type === "Product";
        });

        if (product) {
          const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
          const price =
            offer?.price && offer?.priceCurrency
              ? `${offer.priceCurrency} ${offer.price}`
              : offer?.price;

          return {
            title: product.name,
            description: product.description,
            imageUrl: Array.isArray(product.image) ? product.image[0] : product.image,
            price,
            merchant: product.brand?.name ?? product.brand,
          };
        }
      }
    } catch {
      continue;
    }
  }

  return {};
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { url?: string } | null;

  if (!body?.url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  let url: URL;

  try {
    url = new URL(body.url.trim());
  } catch {
    return NextResponse.json({ error: "URL is invalid" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return NextResponse.json({ error: "URL must use HTTP or HTTPS" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "execv-link-importer/1.0",
      },
    });
    const contentType = response.headers.get("content-type") ?? "";

    if (!response.ok || !contentType.includes("text/html")) {
      return NextResponse.json({
        url: url.toString(),
        title: url.hostname,
        metadataStatus: "failed",
      } satisfies MetadataResult);
    }

    const html = (await response.text()).slice(0, 1_000_000);
    const product = jsonLdProducts(html);
    const title =
      product.title ??
      firstMatch(html, [
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
        /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
        /<title[^>]*>([\s\S]*?)<\/title>/i,
      ]);
    const description =
      product.description ??
      firstMatch(html, [
        /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      ]);
    const imageUrl = absoluteUrl(
      product.imageUrl ??
        firstMatch(html, [
          /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
          /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
        ]),
      response.url
    );

    return NextResponse.json({
      url: response.url,
      title: title || url.hostname,
      description,
      imageUrl,
      price: product.price,
      merchant: product.merchant ?? url.hostname.replace(/^www\./, ""),
      metadataStatus: title || imageUrl || product.price ? "enriched" : "basic",
    } satisfies MetadataResult);
  } catch {
    return NextResponse.json({
      url: url.toString(),
      title: url.hostname,
      metadataStatus: "failed",
    } satisfies MetadataResult);
  }
}
