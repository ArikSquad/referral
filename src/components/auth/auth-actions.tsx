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

export function AuthNavActions() {
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
            <Button>Get started</Button>
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
  return <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />;
}

export function InlineSignUp() {
  return <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />;
}

export function WaitlistPanel() {
  return <Waitlist />;
}
