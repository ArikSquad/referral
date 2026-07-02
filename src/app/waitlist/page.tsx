import Link from "next/link";

import { WaitlistPanel } from "@/components/auth/auth-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "Waitlist",
};

export default function WaitlistPage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
        <Link href="/" className="font-semibold">
          {siteConfig.name}
        </Link>
        <Button asChild variant="outline">
          <Link href="/pricing">Pricing</Link>
        </Button>
      </div>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Wait indefinitely for possible free access.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            Joining the waitlist does not guarantee access or a launch date. If
            we ever release a free tier, waitlist requests may be reviewed then.
            Paid access can unlock the app now, and access may be terminated
            after a subscription ends if product policy requires it.
          </p>
          <Button asChild className="mt-6">
            <Link href="/pricing">Pay for access now</Link>
          </Button>
        </div>
        <WaitlistPanel />
      </section>
    </main>
  );
}
