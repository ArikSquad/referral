import Link from "next/link";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { PricingTable } from "@clerk/nextjs";

export const metadata = {
  title: "Pricing",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
        <Link href="/" className="font-semibold">
          {siteConfig.name}
        </Link>
        <Button asChild variant="outline">
          <Link href="/app">Dashboard</Link>
        </Button>
      </div>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Plans for developer URL shortening.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Paid access unlocks dashboard link creation, API keys, and click
            analytics. Access may end after a subscription expires or is cancelled.
          </p>
        </div>
        <div className="mt-10">
          <PricingTable highlightedPlan="pro"  />
        </div>
      </section>
    </main>
  );
}
