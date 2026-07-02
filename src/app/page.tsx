import {
  ArrowRight,
  Braces,
  CheckCircle2,
  GitBranch,
  Globe2,
  KeyRound,
  LockKeyhole,
  RadioTower,
  ShieldCheck,
  TerminalSquare,
  Webhook,
} from "lucide-react";
import Link from "next/link";

import { AuthNavActions } from "@/components/auth/auth-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

const capabilities = [
  {
    icon: ShieldCheck,
    title: "Policy-aware redirects",
    body: "Country rules, access keys, destination state, and approval status are checked before a referral link resolves.",
  },
  {
    icon: Webhook,
    title: "Affiliate network surface",
    body: "Attach Amazon Associates or another partner network to each program so revenue status can be synced from real integrations.",
  },
  {
    icon: KeyRound,
    title: "Workspace access",
    body: "Members, roles, and invitations stay scoped to the current workspace while every app write checks that boundary.",
  },
];

const pipeline = [
  "request.waitlist({ mode: 'indefinite' })",
  "billing.subscribe({ unlock: 'now' })",
  "link.resolve({ country, accessKey, referrer })",
  "network.sync({ provider: 'amazon-associates', workspaceId })",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/88 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-foreground text-sm font-semibold text-background">
              <TerminalSquare className="size-4" />
            </span>
            <span className="font-semibold tracking-tight">
              {siteConfig.name}
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#platform" className="hover:text-foreground">
              Platform
            </a>
            <a href="#access" className="hover:text-foreground">
              Access
            </a>
            <a href="#integrations" className="hover:text-foreground">
              Integrations
            </a>
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
          </nav>
          <AuthNavActions />
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,oklch(0.93_0.06_178),transparent_32%),radial-gradient(circle_at_84%_10%,oklch(0.92_0.08_252),transparent_28%),linear-gradient(180deg,oklch(0.99_0.006_235),var(--background))] dark:bg-[radial-gradient(circle_at_18%_18%,oklch(0.34_0.08_178),transparent_32%),radial-gradient(circle_at_84%_10%,oklch(0.28_0.08_252),transparent_28%),linear-gradient(180deg,oklch(0.18_0.018_245),var(--background))]" />
          <div className="mx-auto grid min-h-[calc(100svh-8rem)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:py-20">
            <div>
              <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                {siteConfig.name}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Referral links for developers and operators who need
                limitations and affiliate revenue status in the same 
                control plane.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/pricing">
                    Pay for access now
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/waitlist">Wait indefinitely</Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-lg border bg-card/86 p-4 shadow-2xl shadow-foreground/10 backdrop-blur">
                <div className="flex items-center gap-2 border-b pb-3">
                  <span className="size-3 rounded-full bg-red-500" />
                  <span className="size-3 rounded-full bg-amber-500" />
                  <span className="size-3 rounded-full bg-emerald-500" />
                  <span className="ml-3 font-mono text-xs text-muted-foreground">
                    redirect.policy.ts
                  </span>
                </div>
                <pre className="overflow-x-auto pt-4 font-mono text-sm leading-7">
                  <code>{`const decision = await execv.resolve({
  slug: "prime-launch",
  country: request.geo.country,
  accessKey: searchParams.get("key"),
  workspaceId: session.workspaceId,
});

if (!decision.accepted) {
  return redirect("/access-denied");
}

await affiliates.sync("amazon-associates");`}</code>
                </pre>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ["P95", "<100ms"],
                  ["Mode", "paid or wait"],
                  ["Scope", "org-bound"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border bg-background/80 p-4 backdrop-blur"
                  >
                    <p className="font-mono text-xs text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-2 font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="platform" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Referral links with real access decisions.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                The product is built around the redirect path: resolve a link,
                enforce policy, record the outcome, and sync revenue with the external partner program.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {capabilities.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className="rounded-lg border bg-card p-5">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {feature.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="access" className="border-y bg-muted/35">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
            <div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                Wait forever, or pay to unlock now.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Free access is not guaranteed. Joining the waitlist means
                waiting indefinitely unless a free release happens later. Paid
                access can unlock the app immediately, and access may be
                terminated after a subscription ends if the product policy
                requires it.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/pricing">Choose paid access</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/waitlist">Join waitlist</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="integrations" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                Designed for Amazon Associates and partner networks.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Let each workspace connect its own tracking IDs, API keys, and
                webhooks, then show profit status from the source network
                instead of sample revenue.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-5">
              <div className="flex items-center gap-3">
                <Braces className="size-5 text-primary" />
                <h3 className="font-semibold">Event pipeline</h3>
              </div>
              <div className="mt-5 grid gap-3">
                {pipeline.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 font-mono text-sm"
                  >
                    <RadioTower className="size-4 text-muted-foreground" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>{siteConfig.name} by MikArt Europe</p>
          <div className="flex gap-4">
            <Link href="/waitlist" className="hover:text-foreground">
              Waitlist
            </Link>
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href="/app" className="hover:text-foreground">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
