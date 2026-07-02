"use client";

import {
  PricingTable,
  SignIn,
  SignInButton,
  SignUp,
  SignUpButton,
  UserButton,
  Waitlist,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function AuthNavActions() {
  if (!hasClerk) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost">
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild>
          <Link href="/app">Open demo</Link>
        </Button>
      </div>
    );
  }

  return <HostedAuthNavActions />;
}

function HostedAuthNavActions() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <div className="flex items-center gap-2">
      {isLoaded && !isSignedIn ? (
        <>
          <SignInButton mode="modal">
            <Button variant="ghost">Sign in</Button>
          </SignInButton>
          <SignUpButton mode="modal" forceRedirectUrl="/app">
            <Button>Request access</Button>
          </SignUpButton>
        </>
      ) : null}
      {isSignedIn ? (
        <>
          <Button asChild>
            <Link href="/app">Dashboard</Link>
          </Button>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8",
              },
            }}
          />
        </>
      ) : null}
    </div>
  );
}

export function InlineSignIn() {
  if (!hasClerk) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-2xl font-semibold">Demo sign in</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Authentication is not configured. The local demo opens the dashboard
          without an external auth session.
        </p>
        <Button asChild>
          <Link href="/app">Open demo dashboard</Link>
        </Button>
      </div>
    );
  }

  return <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />;
}

export function InlineSignUp() {
  if (!hasClerk) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-2xl font-semibold">Demo request access</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Configure hosted signups, waitlists, and billing entitlements in this
          screen.
        </p>
        <Button asChild>
          <Link href="/waitlist">View waitlist flow</Link>
        </Button>
      </div>
    );
  }

  return <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />;
}

export function WaitlistPanel() {
  if (!hasClerk) {
    return (
      <form className="mx-auto grid w-full max-w-lg gap-3 rounded-lg border bg-card p-5 shadow-sm">
        <label className="text-sm font-medium" htmlFor="email">
          Work email
        </label>
        <input
          id="email"
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-ring transition focus:ring-2"
          placeholder="founder@company.com"
          type="email"
        />
        <Button type="button">Join the demo waitlist</Button>
        <p className="text-xs leading-5 text-muted-foreground">
          Connect the production invite queue before launch.
        </p>
      </form>
    );
  }

  return <Waitlist />;
}

export function BillingPanel() {
  if (!hasClerk) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Operator", "$49", "Unlock access without waiting"],
          ["Scale", "$149", "For teams with approvals and analytics"],
          ["Enterprise", "Custom", "For strict compliance workflows"],
        ].map(([name, price, detail]) => (
          <div
            key={name}
            className="flex min-h-44 flex-col justify-between rounded-lg border bg-card p-5 shadow-sm"
          >
            <div>
              <h3 className="text-lg font-semibold">{name}</h3>
              <p className="mt-2 text-3xl font-semibold">{price}</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {detail}
              </p>
            </div>
            <Button className="mt-5" asChild>
              <Link href="/pricing">Choose access</Link>
            </Button>
          </div>
        ))}
      </div>
    );
  }

  return <PricingTable />;
}
