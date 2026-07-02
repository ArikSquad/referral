import { Activity, ArrowUpRight, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";

import {
  ClickAnalyticsChart,
  SourceQualityChart,
} from "@/components/dashboard/analytics-charts";
import { LinkTable } from "@/components/dashboard/link-table";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  approvalQueue,
  dashboardMetrics,
  managedLinks,
  siteConfig,
} from "@/lib/site";

export default function DashboardPage() {
  return (
    <>
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Govern every short link before it moves traffic.
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Track referral performance, whitelist posture, approval work, and
            blocked attempts across {siteConfig.shortDomain}.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/links/new">
            Create link
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.8fr)]">
        <ClickAnalyticsChart />
        <SourceQualityChart />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)]">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Live link health</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/app/links">All links</Link>
            </Button>
          </div>
          <LinkTable links={managedLinks.slice(0, 4)} compact />
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Approval queue</h2>
            <Badge variant="outline">{approvalQueue.length} open</Badge>
          </div>
          <div className="mt-5 grid gap-4">
            {approvalQueue.length === 0 ? (
              <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
                No pending approvals. New requests will appear here after
                access or billing events are synced.
              </div>
            ) : (
              approvalQueue.map((item) => (
                <div key={item.email} className="grid gap-2 border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{item.requester}</p>
                    <Badge variant="secondary">{item.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.email}</p>
                  <p className="text-sm leading-6">{item.reason}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {item.submitted}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="size-3" />
                      Manual review
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="size-3" />
                      Access
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
