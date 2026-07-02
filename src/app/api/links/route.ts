import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";

import { api } from "../../../../convex/_generated/api";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

const convexUrl =
  process.env.NEXT_PUBLIC_CONVEX_URL ??
  process.env.NEXT_PUBLIC_CONVEX_CLOUD_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

function bearerToken(request: NextRequest) {
  const header =
    request.headers.get("authorization") ?? request.headers.get("x-api-key");

  if (!header) {
    return null;
  }

  return header.replace(/^Bearer\s+/i, "").trim();
}

export async function POST(request: NextRequest) {
  if (!convex) {
    return NextResponse.json(
      { error: "Convex is not configured" },
      { status: 500 }
    );
  }

  const apiKey = bearerToken(request);

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing API key" },
      { status: 401 }
    );
  }

  let body: { url?: string; destination?: string; slug?: string; name?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const destination = body.destination ?? body.url;

  if (!destination) {
    return NextResponse.json(
      { error: "`destination` is required" },
      { status: 400 }
    );
  }

  try {
    const link = await convex.mutation(api.links.create, {
      name: body.name,
      slug: body.slug,
      destination,
    });

    if (!link) {
      return NextResponse.json(
        { error: "Link could not be created" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        id: link._id,
        slug: link.slug,
        url: `${siteConfig.url.replace(/\/$/, "")}/${link.slug}`,
        destination: link.destination,
        createdAt: link.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed" },
      { status: 400 }
    );
  }
}
