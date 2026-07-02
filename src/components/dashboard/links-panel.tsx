"use client";

import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import { LinkTable } from "@/components/dashboard/link-table";
import type { ManagedLink } from "@/lib/site";

export function LinksPanel({ fallback }: { fallback: ManagedLink[] }) {
  const hasDataClient = Boolean(process.env.NEXT_PUBLIC_CONVEX_CLOUD_URL);
  const links = useQuery(api.links.listMine);

  if (!hasDataClient) {
    return <LinkTable links={fallback} />;
  }

  if (links === undefined) {
    return (
      <div className="rounded-lg border bg-card p-8 text-sm text-muted-foreground shadow-sm">
        Loading links...
      </div>
    );
  }

  return (
    <LinkTable
      links={links.map((link) => ({
        id: link._id,
        name: link.name,
        slug: link.slug,
        destination: link.destination,
        owner: String(link.ownerId),
        status: link.status,
        mode: link.mode,
        allowlist: link.allowlist,
        clicks: link.clicks,
        conversions: link.conversions,
        revenue: `$${(link.revenueCents / 100).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        lastClick: "No clicks yet",
        risk: "low",
        allowCountries: link.allowCountries,
        blockedCountries: link.blockedCountries,
        accessKeyRequired: Boolean(link.accessKeyHash),
        affiliateNetwork: link.affiliateNetwork,
        affiliateStatus: link.affiliateStatus,
        startsAt: link.startsAt,
        expiresAt: link.expiresAt,
      }))}
    />
  );
}
