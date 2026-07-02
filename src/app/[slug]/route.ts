import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";

import { api } from "../../../convex/_generated/api";
import { captureServerEvent } from "@/lib/posthog-server";

export const dynamic = "force-dynamic";

const convexUrl =
  process.env.NEXT_PUBLIC_CONVEX_URL ??
  process.env.NEXT_PUBLIC_CONVEX_CLOUD_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

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
  const result = await convex.mutation(api.clicks.record, {
    slug,
    referrer: request.headers.get("referer") ?? undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
    country,
  });

  if (!result.accepted || !result.destination) {
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
  });

  return NextResponse.redirect(result.destination, 302);
}
