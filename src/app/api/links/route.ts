import { ConvexHttpClient } from "convex/browser";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { api } from "../../../../convex/_generated/api";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

const convexUrl =
  process.env.NEXT_PUBLIC_CONVEX_URL ??
  process.env.NEXT_PUBLIC_CONVEX_CLOUD_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

export async function POST(request: NextRequest) {
  if (!convex) {
    return NextResponse.json(
      { error: "Convex is not configured" },
      { status: 500 }
    );
  }

  const session = await auth({ acceptsToken: "api_key" });

  if (!session.isAuthenticated || session.tokenType !== "api_key") {
    return NextResponse.json(
      { error: "Unauthorized" },
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
    const subjectId = session.orgId ?? session.userId;

    if (!subjectId) {
      return NextResponse.json(
        { error: "API key subject is required" },
        { status: 400 }
      );
    }

    const client = await clerkClient();
    const [user, organization] = await Promise.all([
      session.userId ? client.users.getUser(session.userId) : null,
      session.orgId
        ? client.organizations.getOrganization({
            organizationId: session.orgId,
          })
        : null,
    ]);
    const metadata = user?.publicMetadata as { role?: string } | undefined;
    const claims = session.claims as { role?: string } | null;
    const namespace =
      organization?.slug ??
      user?.username ??
      user?.firstName ??
      session.userId ??
      subjectId;
    const link = await convex.mutation(api.links.createFromApi, {
      clerkUserId: subjectId,
      email: user?.emailAddresses.at(0)?.emailAddress,
      ownerName: organization?.name ?? user?.fullName ?? user?.username ?? undefined,
      namespace,
      isStaff: metadata?.role === "staff" || claims?.role === "staff",
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
        url: `https://${siteConfig.shortDomain.replace(/\/$/, "")}/${link.slug}`,
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
