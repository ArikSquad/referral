import { CreditCard, Hourglass, ShieldX } from "lucide-react";
import Link from "next/link";

import type { AppAccess } from "@/lib/auth";
import { requiredPlan } from "@/lib/env";
import { siteConfig } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AccessGate({ access }: { access: AppAccess }) {
  const isBilling = access.status === "needs-plan";
  const isRejected = access.status === "rejected";
  const Icon = isBilling ? CreditCard : isRejected ? ShieldX : Hourglass;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <section className="w-full max-w-xl rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-5" />
          </div>
          <div>
            <Badge variant={isRejected ? "destructive" : "secondary"}>
              {isBilling
                ? "Subscription required"
                : isRejected
                  ? "Access denied"
                  : "Waitlist pending"}
            </Badge>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              {isBilling
                ? `The ${requiredPlan} plan is required`
                : isRejected
                  ? "This workspace is not approved"
                  : "Wait indefinitely or subscribe now"}
            </h1>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/pricing">Pay for access now</Link>
          </Button>
          {!isBilling && !isRejected ? (
            <Button asChild variant="secondary">
              <Link href="/waitlist">Wait indefinitely</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/">Back to {siteConfig.name}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
