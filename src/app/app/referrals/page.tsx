import { ArrowUpRight, BadgeDollarSign, CircleGauge, Users2 } from "lucide-react";

import { AffiliateSetup } from "@/components/dashboard/affiliate-setup";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { managedLinks } from "@/lib/site";

export const metadata = {
  title: "Referrals",
};

export default function ReferralsPage() {
  return (
    <>
      <section>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Partner performance
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Monitor approved partners, revenue quality, conversion rate, and
          suspicious redirect attempts by program.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Partner revenue"
          value="$0.00"
          change="+0%"
          icon={BadgeDollarSign}
          tone="teal"
        />
        <MetricCard
          label="Active partners"
          value="0"
          change="+0"
          icon={Users2}
          tone="blue"
        />
        <MetricCard
          label="Quality score"
          value="0"
          change="+0"
          icon={CircleGauge}
          tone="amber"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {managedLinks.filter((link) => link.mode === "Referral").length === 0 ? (
          <div className="lg:col-span-2">
            <AffiliateSetup />
          </div>
        ) : (
          managedLinks
          .filter((link) => link.mode === "Referral")
          .map((link) => (
            <article
              key={link.id}
              className="rounded-lg border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{link.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {link.conversions.toLocaleString()} conversions from{" "}
                    {link.clicks.toLocaleString()} verified clicks
                  </p>
                </div>
                <Badge variant="outline">
                  {link.revenue}
                  <ArrowUpRight className="size-3" />
                </Badge>
              </div>
              <div className="mt-5 grid gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Conversion efficiency</span>
                  <span className="font-medium">
                    {Math.round((link.conversions / link.clicks) * 100)}%
                  </span>
                </div>
                <Progress value={(link.conversions / link.clicks) * 100} />
              </div>
            </article>
          ))
        )}
      </section>
    </>
  );
}
